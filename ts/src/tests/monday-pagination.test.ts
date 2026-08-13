import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { MONDAY_API_VERSION, MONDAY_MAX_PAGE_SIZE } from '../apps/monday/constants';
import { getMondayBoardIdAllowedValues } from '../apps/monday/helpers/get-board-id-allowed-values';
import { getMondayPeopleAllowedValues } from '../apps/monday/helpers/get-people-allowed-values';
import { getMondayRecordIdAllowedValues } from '../apps/monday/helpers/get-record-id-allowed-values';

jest.mock('@qoretechnologies/ts-toolkit', () => ({
  ...jest.requireActual('@qoretechnologies/ts-toolkit'),
  QorusRequest: { post: jest.fn() },
}));

/**
 * One captured request: the composed GraphQL query text and the headers it was sent under.
 *
 * monday composes its paging arguments into the query string rather than into variables, so the
 * text is the only place the `limit`/`page` contract is observable.
 */
type TCapturedCall = {
  query: string;
  headers: Record<string, string>;
};

const post = QorusRequest.post as unknown as jest.Mock;

const CONTEXT = { conn_opts: { token: 'test-token' }, opts: { board_id: '1' } } as any;

/** wraps a GraphQL `data` payload the way the HTTP client hands it back */
const asResponse = (data: Record<string, any>) => ({ data: { data } });

const makeUsers = (count: number, offset = 0) =>
  Array.from({ length: count }, (_unused, index) => ({
    id: offset + index,
    name: `user-${offset + index}`,
    email: `user-${offset + index}@example.com`,
    enabled: true,
  }));

const makeBoards = (count: number, offset = 0) =>
  Array.from({ length: count }, (_unused, index) => ({
    id: `${offset + index}`,
    name: `board-${offset + index}`,
  }));

/**
 * Installs a responder and records every request it answers.
 *
 * @param respond - receives the composed query text and returns the GraphQL `data` payload for it.
 */
const captureCalls = (respond: (query: string, callIndex: number) => Record<string, any>) => {
  const calls: TCapturedCall[] = [];

  post.mockImplementation(async (request: any) => {
    calls.push({ query: request.data.query, headers: request.headers });
    return asResponse(respond(request.data.query, calls.length - 1));
  });

  return calls;
};

beforeEach(() => {
  post.mockReset();
});

describe('monday API version pinning', () => {
  it('sends the pinned API-Version header on every request', async () => {
    const calls = captureCalls((query) =>
      query.includes('GetTeams') ? { teams: [] } : { users: [] }
    );

    await getMondayPeopleAllowedValues(CONTEXT);

    expect(calls.length).toBeGreaterThan(0);
    calls.forEach((call) => {
      expect(call.headers['API-Version']).toBe(MONDAY_API_VERSION);
    });
  });

  it('pins the current stable version, never the release candidate', () => {
    // 2026-10 removes the deprecated User fields this application still selects, and is only a
    // release candidate until 2026-10-01 — riding it early breaks the people picker outright
    expect(MONDAY_API_VERSION).toBe('2026-07');
  });
});

describe('getMondayPeopleAllowedValues', () => {
  it('asks for an explicit page of users rather than accepting the 200-row default', async () => {
    const calls = captureCalls((query) =>
      query.includes('GetTeams') ? { teams: [] } : { users: [] }
    );

    await getMondayPeopleAllowedValues(CONTEXT);

    const usersCall = calls.find((call) => call.query.includes('GetUsers'));

    expect(usersCall).toBeDefined();
    expect(usersCall!.query).toContain(`limit: ${MONDAY_MAX_PAGE_SIZE}`);
    expect(usersCall!.query).toContain('page: 1');
  });

  it('returns every user in a workspace larger than one page', async () => {
    captureCalls((query) => {
      if (query.includes('GetTeams')) {
        return { teams: [] };
      }

      // page 1 is full, so the collection cannot be known to be exhausted; page 2 is short
      return {
        users: query.includes('page: 1')
          ? makeUsers(MONDAY_MAX_PAGE_SIZE)
          : makeUsers(7, MONDAY_MAX_PAGE_SIZE),
      };
    });

    const allowedValues = await getMondayPeopleAllowedValues(CONTEXT);

    expect(allowedValues).toHaveLength(MONDAY_MAX_PAGE_SIZE + 7);
    // the last user of the second page survived, so nothing was truncated at the page boundary
    expect(allowedValues[allowedValues.length - 1].display_name).toBe(
      `user-${MONDAY_MAX_PAGE_SIZE + 6}`
    );
  });

  it('stops after one request when the first page is short', async () => {
    const calls = captureCalls((query) =>
      query.includes('GetTeams') ? { teams: [] } : { users: makeUsers(3) }
    );

    await getMondayPeopleAllowedValues(CONTEXT);

    expect(calls.filter((call) => call.query.includes('GetUsers'))).toHaveLength(1);
  });

  it('reports an unresolved users collection instead of returning an empty picker', async () => {
    captureCalls((query) => (query.includes('GetTeams') ? { teams: [] } : {}));

    await expect(getMondayPeopleAllowedValues(CONTEXT)).rejects.toThrow(/no "users" collection/);
  });
});

describe('getMondayBoardIdAllowedValues', () => {
  it('asks for an explicit page of boards rather than accepting the 25-row default', async () => {
    const calls = captureCalls(() => ({ boards: [] }));

    await getMondayBoardIdAllowedValues(CONTEXT);

    expect(calls).toHaveLength(1);
    expect(calls[0].query).toMatch(/boards\(limit: \d+, page: 1\)/);
  });

  it('returns boards beyond the first page', async () => {
    let pageSize = 0;

    captureCalls((query) => {
      const limit = Number(/limit: (\d+)/.exec(query)![1]);
      pageSize = limit;

      return { boards: query.includes('page: 1') ? makeBoards(limit) : makeBoards(4, limit) };
    });

    const allowedValues = await getMondayBoardIdAllowedValues(CONTEXT);

    expect(allowedValues).toHaveLength(pageSize + 4);
  });
});

describe('getMondayRecordIdAllowedValues', () => {
  it('states the item-page bound rather than inheriting monday’s default of 25', async () => {
    const calls = captureCalls(() => ({
      boards: [{ items_page: { cursor: null, items: [] } }],
    }));

    await getMondayRecordIdAllowedValues(CONTEXT);

    expect(calls).toHaveLength(1);
    expect(calls[0].query).toMatch(/items_page\(limit: \d+,/);
  });
});
