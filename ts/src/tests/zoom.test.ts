// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { ZOOM_TRIGGER_KEY_VERSION, ZoomError } from '../apps/zoom/constants';
import { fetchZoomRecords } from '../apps/zoom/helpers/constants';
import { toZoomDate, toZoomDateTime } from '../apps/zoom/helpers/dates';
import { getZoomMeetingTemplateIdAllowedValues } from '../apps/zoom/helpers/get-meeting-template-allowed-values';
import { getZoomWebinarIdAllowedValues } from '../apps/zoom/helpers/get-webinar-id-allowed-values';
import { getZoomWebinarTemplateIdAllowedValues } from '../apps/zoom/helpers/get-webinar-template-allowed-values';
import { NewZoomMeetingSummary, NewZoomMeetingTrigger } from '../apps/zoom/triggers';
import { ITriggerCheckpoint, runWithTriggerCheckpoint } from '../global/helpers/trigger-checkpoint';

jest.mock('@qoretechnologies/ts-toolkit', () => ({
  ...jest.requireActual('@qoretechnologies/ts-toolkit'),
  QorusRequest: { get: jest.fn() },
}));

jest.mock('../global/constants', () => ({
  ...jest.requireActual('../global/constants'),
  // keep the tests fast: the real interval is 10 minutes
  DEFAULT_TRIGGER_POLLING_INTERVAL: 5,
}));

const get = QorusRequest.get as unknown as jest.Mock;

/** One request as the Zoom helpers hand it to the HTTP client. */
type TRequest = {
  path: string;
  params: Record<string, string>;
  headers: Record<string, string>;
};

const requests = (): TRequest[] => get.mock.calls.map(([request]) => request);

const TOKEN = 'fixture-token';
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const context = (opts: Record<string, unknown> = {}) =>
  ({ conn_opts: { token: TOKEN }, opts }) as any;

/** A failed request as the HTTP client rejects it: Zoom's message, and the response's status. */
const httpFailure = (statusCode: number, message: string) =>
  Object.assign(new Error(message), { statusCode });

type TTestCheckpoint = ITriggerCheckpoint & { saved: Record<string, any>[] };

/** A checkpoint API backed by memory, standing in for the host's durable storage. */
const makeCheckpoint = (initial?: Record<string, any>): TTestCheckpoint => {
  let state = initial;
  const checkpoint: TTestCheckpoint = {
    saved: [],
    get: () => state,
    set: async (next) => {
      state = next;
      checkpoint.saved.push(next);
    },
  };

  return checkpoint;
};

/**
 * Runs a trigger's event function and returns the events it delivered.
 *
 * `respond` answers each request by its index. Requests `0` to `polls - 1` are processed: without a
 * restored checkpoint, request `0` is the baseline and its items are never delivered. Request `polls` is
 * made but not processed, since the poller checks `should_stop` before each item.
 */
const runTrigger = async (
  trigger: any,
  ctx: any,
  respond: (requestIndex: number) => unknown,
  polls: number
): Promise<any[]> => {
  const events: any[] = [];
  let started = 0;

  get.mockImplementation(async () => respond(started++));

  await trigger.event_function(
    ctx,
    (event: any) => {
      events.push(event);
    },
    () => started > polls
  );

  return events;
};

/** Answers every request from `pages`, repeating the last page once they run out. */
const pagesOf = (wrap: (items: any[]) => unknown, pages: any[][]) => (requestIndex: number) =>
  wrap(pages[Math.min(requestIndex, pages.length - 1)]);

beforeEach(() => {
  get.mockReset();
});

describe('Zoom date formats', () => {
  it('formats the calendar day in UTC', () => {
    expect(toZoomDate(new Date('2026-10-05T23:30:00.414-02:00'))).toBe('2026-10-06');
    expect(toZoomDate(new Date('2026-10-05T00:00:00.000Z'))).toBe('2026-10-05');
  });

  it('formats a date-time without milliseconds', () => {
    expect(toZoomDateTime(new Date('2026-10-05T15:48:30.414Z'))).toBe('2026-10-05T15:48:30Z');
    expect(toZoomDateTime(new Date('2026-10-05T15:48:30Z'))).toBe('2026-10-05T15:48:30Z');
    expect(toZoomDateTime(new Date('2026-10-05T17:48:30+02:00'))).toBe('2026-10-05T15:48:30Z');
  });

  it('rejects an invalid date', () => {
    expect(() => toZoomDate(new Date('garbage'))).toThrow(ZoomError);
    expect(() => toZoomDateTime(new Date('garbage'))).toThrow(ZoomError);
    expect(() => toZoomDate('2026-10-05' as unknown as Date)).toThrow(ZoomError);
  });
});

describe('New Meeting Summary trigger', () => {
  const trigger: any = NewZoomMeetingSummary;

  const summaryOf = (meeting_id: number, meeting_uuid: string, at = '2026-10-05T10:00:00Z') => ({
    meeting_id,
    meeting_uuid,
    meeting_host_id: 'host',
    meeting_host_email: 'host@example.com',
    meeting_topic: 'Weekly sync',
    meeting_start_time: at,
    meeting_end_time: at,
    summary_created_time: at,
    summary_start_time: at,
    summary_end_time: at,
    summary_last_modified_time: at,
  });

  const summariesPage = (summaries: any[]) => ({ data: { summaries } });

  it("lists the user's own summaries for the example event", async () => {
    const summary = summaryOf(1, 'instance-1');
    get.mockResolvedValue(summariesPage([summary]));

    await expect(trigger.get_example_event_data(context())).resolves.toEqual(summary);

    const [request] = requests();
    // not `/meetings/meeting_summaries`: that one needs an admin scope a user-managed app cannot hold
    expect(request.path).toBe('/users/me/meeting_summaries');
    expect(request.params).toEqual({ page_size: '50' });
    expect(request.headers).toEqual({ Authorization: `Bearer ${TOKEN}` });
  });

  it('has no example event while the account has no summaries', async () => {
    get.mockResolvedValue(summariesPage([]));

    await expect(trigger.get_example_event_data(context())).resolves.toBeNull();
  });

  it('treats a body without a list and without a message as empty', async () => {
    get.mockResolvedValue({ data: {} });

    await expect(trigger.get_example_event_data(context())).resolves.toBeNull();
  });

  it('reports an account without the feature instead of an empty feed', async () => {
    // Zoom's answer on a free account: a 200 with a message and no list
    get.mockResolvedValue({ data: { code: 200, message: 'Only available for Paid account.' } });

    const example = trigger.get_example_event_data(context());

    await expect(example).rejects.toThrow(ZoomError);
    await expect(example).rejects.toThrow(
      'Zoom did not list the meeting summaries: Only available for Paid account.'
    );
  });

  it('wraps a failed request', async () => {
    get.mockRejectedValue(
      httpFailure(
        400,
        'Invalid access token, does not contain scopes:[meeting:read:list_summaries].'
      )
    );

    await expect(trigger.get_example_event_data(context())).rejects.toThrow(
      'Failed to fetch latest meeting summaries: Invalid access token'
    );
  });

  it('fails without a token', async () => {
    await expect(trigger.get_example_event_data({ conn_opts: {} })).rejects.toThrow(ZoomError);
    expect(get).not.toHaveBeenCalled();
  });

  it('polls by the time the summary was created, an hour back of the last poll', async () => {
    const started = Date.now();

    await runTrigger(trigger, context(), () => summariesPage([]), 2);

    const polling = requests();
    expect(polling.length).toBeGreaterThanOrEqual(2);

    for (const request of polling) {
      expect(request.path).toBe('/users/me/meeting_summaries');
      expect(request.params.page_size).toBe('50');
      expect(request.params.time_filter_field).toBe('summary_created_time');
      // the documented date-time format: no milliseconds
      expect(request.params.from).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);

      const from = Date.parse(request.params.from);
      expect(started - from).toBeGreaterThanOrEqual(HOUR_MS - 1000);
      expect(Date.now() - from).toBeLessThan(HOUR_MS + 10_000);
    }
  });

  it('reports every instance of a recurring meeting', async () => {
    // two instances of meeting 42: they share the meeting number and differ in the instance UUID
    const first = summaryOf(42, 'instance-a', '2026-10-05T10:00:00Z');
    const second = summaryOf(42, 'instance-b', '2026-10-12T10:00:00Z');

    const events = await runTrigger(
      trigger,
      context(),
      pagesOf(summariesPage, [[], [first], [second, first]]),
      3
    );

    expect(events.map((event) => event.meeting_uuid)).toEqual(['instance-a', 'instance-b']);
  });

  it('does not resume from a checkpoint stored under the old meeting-number key', async () => {
    // the state a previous release stored: meeting numbers, which match no instance UUID
    const checkpoint = makeCheckpoint({ version: 1, delivered: [42] });
    const first = summaryOf(42, 'instance-a');
    const second = summaryOf(42, 'instance-b');

    const events = await runWithTriggerCheckpoint(checkpoint, () =>
      runTrigger(trigger, context(), pagesOf(summariesPage, [[first], [second, first]]), 2)
    );

    // the first poll is a fresh baseline, so the summary already there is not replayed
    expect(events.map((event) => event.meeting_uuid)).toEqual(['instance-b']);
    expect(checkpoint.saved[0]).toEqual({
      version: 1,
      keyVersion: ZOOM_TRIGGER_KEY_VERSION,
      delivered: ['instance-a'],
    });
    expect(checkpoint.saved.at(-1)).toEqual({
      version: 1,
      keyVersion: ZOOM_TRIGGER_KEY_VERSION,
      delivered: ['instance-a', 'instance-b'],
    });
  });

  it('resumes from a checkpoint stored under the current key', async () => {
    const checkpoint = makeCheckpoint({
      version: 1,
      keyVersion: ZOOM_TRIGGER_KEY_VERSION,
      delivered: ['instance-a'],
    });
    const first = summaryOf(42, 'instance-a');
    const second = summaryOf(42, 'instance-b');

    const events = await runWithTriggerCheckpoint(checkpoint, () =>
      runTrigger(trigger, context(), pagesOf(summariesPage, [[second, first]]), 1)
    );

    // no baseline: the summary that arrived while the trigger was down is delivered
    expect(events.map((event) => event.meeting_uuid)).toEqual(['instance-b']);
  });
});

describe('New Meeting trigger', () => {
  const trigger: any = NewZoomMeetingTrigger;

  const meetingOf = (id: number, uuid: string, type = 8) => ({
    id,
    uuid,
    host_id: 'host',
    topic: 'Standup',
    agenda: '',
    type,
    start_time: '2026-10-05T09:00:00Z',
    duration: 30,
    timezone: 'UTC',
    created_at: '2026-10-01T00:00:00Z',
    join_url: 'https://zoom.us/j/1',
    pmi: '',
  });

  const meetingsPage = (meetings: any[]) => ({ data: { meetings } });

  /** Two instances of recurring meeting 42, newest first, as the pages of three polls. */
  const recurringPages = [
    [],
    [meetingOf(42, 'instance-a')],
    [meetingOf(42, 'instance-b'), meetingOf(42, 'instance-a')],
  ];

  it('asks for the configured kind of meeting over a UTC calendar-day window', async () => {
    const started = Date.now();

    await runTrigger(
      trigger,
      context({ meeting_event_type: 'previous_meetings' }),
      () => meetingsPage([]),
      1
    );

    const polling = requests();
    expect(polling.length).toBeGreaterThanOrEqual(1);

    // the day before the poll, in UTC; both candidates in case the test runs across midnight
    const expectedFrom = [started, Date.now()].map((at) => toZoomDate(new Date(at - DAY_MS)));

    for (const request of polling) {
      expect(request.path).toBe('/users/me/meetings');
      expect(request.params.type).toBe('previous_meetings');
      expect(request.params.page_size).toBe('50');
      expect(request.params.timezone).toBe('UTC');
      // the documented date format: a calendar day, no time
      expect(request.params.from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(expectedFrom).toContain(request.params.from);
      expect(request.headers).toEqual({ Authorization: `Bearer ${TOKEN}` });
    }
  });

  it.each(['live', 'previous_meetings'])(
    'reports every instance of a recurring meeting for %s',
    async (meeting_event_type) => {
      const events = await runTrigger(
        trigger,
        context({ meeting_event_type }),
        pagesOf(meetingsPage, recurringPages),
        3
      );

      expect(events.map((event) => event.uuid)).toEqual(['instance-a', 'instance-b']);
    }
  );

  it('reports a recurring meeting once when it is created', async () => {
    const events = await runTrigger(
      trigger,
      context({ meeting_event_type: 'upcoming' }),
      pagesOf(meetingsPage, recurringPages),
      3
    );

    // the series is one meeting: its occurrences share the meeting number
    expect(events.map((event) => event.uuid)).toEqual(['instance-a']);
  });

  it('names the kind of meeting on the event', async () => {
    const events = await runTrigger(
      trigger,
      context({ meeting_event_type: 'live' }),
      pagesOf(meetingsPage, [[], [meetingOf(2, 'b', 99), meetingOf(1, 'a', 8)]]),
      2
    );

    expect(events.map((event) => event.meeting_type_name)).toEqual([
      'Recurring Meeting with fixed time',
      'Unknown Meeting Type',
    ]);
  });

  it('does not resume from a checkpoint stored under the old meeting-number key', async () => {
    const checkpoint = makeCheckpoint({ version: 1, delivered: [42] });

    const events = await runWithTriggerCheckpoint(checkpoint, () =>
      runTrigger(
        trigger,
        context({ meeting_event_type: 'live' }),
        pagesOf(meetingsPage, recurringPages.slice(1)),
        2
      )
    );

    expect(events.map((event) => event.uuid)).toEqual(['instance-b']);
    expect(checkpoint.saved[0]).toEqual({
      version: 1,
      keyVersion: ZOOM_TRIGGER_KEY_VERSION,
      delivered: ['instance-a'],
    });
  });

  it('shows an example of the kind of meeting being set up', async () => {
    const meeting = meetingOf(7, 'instance-7', 2);
    get.mockResolvedValue(meetingsPage([meeting]));

    await expect(
      trigger.get_example_event_data(context({ meeting_event_type: 'previous_meetings' }))
    ).resolves.toEqual({ ...meeting, meeting_type_name: 'Scheduled Meeting' });

    const [request] = requests();
    expect(request.path).toBe('/users/me/meetings');
    // the example is not a poll: no window
    expect(request.params).toEqual({ page_size: '50', type: 'previous_meetings' });
  });

  it('shows an upcoming meeting as the example before the kind is chosen', async () => {
    get.mockResolvedValue(meetingsPage([]));

    await expect(trigger.get_example_event_data(context())).resolves.toBeNull();

    // Zoom's own default lists the meetings running right now, which is nearly always nothing
    expect(requests()[0].params.type).toBe('upcoming');
  });

  it('wraps a failed request', async () => {
    get.mockRejectedValue(httpFailure(401, 'Invalid access token.'));

    await expect(trigger.get_example_event_data(context())).rejects.toThrow(
      'Failed to fetch latest meetings: Invalid access token.'
    );
  });

  it('fails without the event type', async () => {
    await expect(trigger.event_function(context(), jest.fn(), () => true)).rejects.toThrow(
      ZoomError
    );
    expect(get).not.toHaveBeenCalled();
  });
});

describe('webinar choices', () => {
  const webinar = {
    id: 95000123456,
    uuid: 'K9b1/abc+def==',
    topic: 'Launch',
    agenda: 'Q4 launch',
    start_time: '2026-10-06T10:00:00Z',
    duration: 60,
    timezone: 'UTC',
  };

  const webinarsPage = (webinars: any[], next_page_token?: string) => ({
    data: { webinars, page_size: 100, total_records: webinars.length, next_page_token },
  });

  it('offers the integer webinar ID, which every webinar endpoint accepts', async () => {
    get.mockResolvedValue(webinarsPage([webinar]));

    await expect(getZoomWebinarIdAllowedValues(context())).resolves.toEqual([
      {
        value: '95000123456',
        display_name: 'Launch',
        desc: 'Start Time: 2026-10-06T10:00:00Z\nDuration: 60 minutes\nTimezone: UTC\nAgenda: Q4 launch',
      },
    ]);

    const [request] = requests();
    expect(request.path).toBe('/users/me/webinars');
    expect(request.params).toEqual({ page_size: '100' });
  });

  it('lists the webinars of the user the action names', async () => {
    get.mockResolvedValue(webinarsPage([]));

    await expect(getZoomWebinarIdAllowedValues(context({ userId: 'u-1' }))).resolves.toEqual([]);

    expect(requests()[0].path).toBe('/users/u-1/webinars');
  });

  it('reports a missing Webinar plan instead of an empty list', async () => {
    get.mockRejectedValue(
      httpFailure(400, 'Webinar plan is missing. Available for Pro, Business and Enterprise.')
    );

    const values = getZoomWebinarIdAllowedValues(context());

    await expect(values).rejects.toThrow(ZoomError);
    await expect(values).rejects.toThrow(
      'Failed to fetch Zoom webinars: HTTP 400: Webinar plan is missing.'
    );
  });

  it('fails without a token', async () => {
    await expect(getZoomWebinarIdAllowedValues({ conn_opts: {} } as any)).rejects.toThrow(
      ZoomError
    );
    expect(get).not.toHaveBeenCalled();
  });
});

describe('template choices', () => {
  it.each([
    ['meeting', getZoomMeetingTemplateIdAllowedValues, 'meeting_templates', 'Meeting Template'],
    ['webinar', getZoomWebinarTemplateIdAllowedValues, 'webinar_templates', 'Webinar Template'],
  ])(
    'lists the %s templates of the user the action names',
    async (_kind, choices, object, type) => {
      get.mockResolvedValue({ data: { templates: [{ id: 't-1', name: 'Standup', type: 1 }] } });

      await expect(choices(context({ userId: 'u-1' }))).resolves.toEqual([
        { value: 't-1', display_name: 'Standup', desc: `Type: ${type}\nID: t-1` },
      ]);
      expect(requests()[0].path).toBe(`/users/u-1/${object}`);

      get.mockClear();
      await choices(context());
      expect(requests()[0].path).toBe(`/users/me/${object}`);
    }
  );
});

describe('fetchZoomRecords', () => {
  const records = (overrides: Record<string, unknown> = {}) =>
    fetchZoomRecords<{ id: number }, 'webinars'>({
      token: TOKEN,
      path: '/users/me/webinars',
      object: 'webinars',
      ...overrides,
    });

  const page = (ids: number[], next_page_token?: string) => ({
    data: {
      webinars: ids.map((id) => ({ id })),
      page_size: 100,
      total_records: ids.length,
      next_page_token,
    },
  });

  it('collects every page, continuing with the page token', async () => {
    get.mockResolvedValueOnce(page([1, 2], 'page-2')).mockResolvedValueOnce(page([3]));

    await expect(records()).resolves.toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);

    const [first, second] = requests();
    expect(first.params).toEqual({ page_size: '100' });
    expect(second.params).toEqual({ page_size: '100', next_page_token: 'page-2' });
  });

  it('rejects a failed first page as a ZoomError, never an empty list', async () => {
    get.mockRejectedValue(httpFailure(401, 'Invalid access token.'));

    const result = records();

    await expect(result).rejects.toThrow(ZoomError);
    await expect(result).rejects.toThrow(
      'Failed to fetch Zoom webinars: HTTP 401: Invalid access token.'
    );
  });

  it('rejects a failed later page rather than returning the pages before it', async () => {
    get
      .mockResolvedValueOnce(page([1], 'page-2'))
      .mockRejectedValueOnce(httpFailure(429, 'Too many requests.'));

    await expect(records()).rejects.toThrow(
      'Failed to fetch Zoom webinars: HTTP 429: Too many requests.'
    );
  });

  it('names a failure that has no HTTP status', async () => {
    get.mockRejectedValue(new Error('socket hang up'));

    await expect(records()).rejects.toThrow('Failed to fetch Zoom webinars: socket hang up');
  });

  it('returns an empty list for an empty page', async () => {
    get.mockResolvedValue(page([]));

    await expect(records()).resolves.toEqual([]);
  });

  it('returns an empty list when the response carries no data', async () => {
    get.mockResolvedValueOnce(undefined);
    await expect(records()).resolves.toEqual([]);

    get.mockResolvedValueOnce({});
    await expect(records()).resolves.toEqual([]);
  });

  it('stops once maxResults items are collected', async () => {
    get.mockResolvedValue(page([1, 2], 'more'));

    await expect(records({ maxResults: 2 })).resolves.toEqual([{ id: 1 }, { id: 2 }]);
    expect(get).toHaveBeenCalledTimes(1);
  });
});
