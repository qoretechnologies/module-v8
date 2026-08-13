import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import * as DYNAMICS_TRIGGERS from '../apps/dynamics/triggers';

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

/**
 * Runs a trigger's polling loop for exactly one cycle and returns the requests it made.
 *
 * The loop is ended from inside the responder rather than after a delay, so the test neither waits
 * nor races: the first request is answered, the stop flag is set, and the loop exits at its next
 * check.
 */
const captureOnePoll = async (
  trigger: any,
  opts: Record<string, any>
): Promise<Record<string, string>[]> => {
  const requests: Record<string, string>[] = [];
  let stop = false;

  get.mockImplementation(async (request: any) => {
    requests.push(request.params);
    stop = true;
    return { data: { value: [] } };
  });

  await trigger.event_function(
    { conn_opts: { token: 'test-token', url: 'https://org.crm.dynamics.com' }, opts },
    () => {},
    () => stop
  );

  return requests;
};

beforeEach(() => {
  get.mockReset();
});

/**
 * Every one of these triggers polls with `$top`, and none of them sends a `$filter`, so the page is
 * simply the first N rows of the requested ordering. Ordering ascending therefore pins the window
 * to the *oldest* N rows of the entity: on any table with more than N records a newly created or
 * modified row is never inside the page, and the trigger stops firing altogether. Seven of the
 * eight shipped that way; `new-order` alone ordered descending, which is what shows it was a
 * copy-paste slip rather than a design.
 */
describe('Dynamics triggers poll the most recent rows', () => {
  const CASES: [string, any, Record<string, any>][] = [
    ['account', DYNAMICS_TRIGGERS.NewDynamicsAccount, { condition: 'created' }],
    ['case', DYNAMICS_TRIGGERS.NewDynamicsCase, { condition: 'created' }],
    ['contact', DYNAMICS_TRIGGERS.NewDynamicsContact, { condition: 'created' }],
    ['invoice', DYNAMICS_TRIGGERS.NewDynamicsInvoice, { condition: 'created' }],
    ['lead', DYNAMICS_TRIGGERS.NewDynamicsLead, { condition: 'created' }],
    ['opportunity', DYNAMICS_TRIGGERS.NewDynamicsOpportunity, { condition: 'created' }],
    ['order', DYNAMICS_TRIGGERS.NewDynamicsOrder, { condition: 'created' }],
    ['custom entity', DYNAMICS_TRIGGERS.NewDynamicsCustomEntity, { entityName: 'cr123_widget' }],
  ];

  it.each(CASES)(
    'orders the %s feed newest-first when watching creates',
    async (_name, trigger, opts) => {
      const requests = await captureOnePoll(trigger, opts);

      expect(requests.length).toBeGreaterThan(0);
      requests.forEach((params) => {
        expect(params.$orderby).toMatch(/\bdesc$/);
        expect(params.$top).toBeDefined();
      });
    }
  );

  it('orders the feed newest-first when watching updates too', async () => {
    // the updated branch polls `modifiedon`; it has the same window and the same failure
    const requests = await captureOnePoll(DYNAMICS_TRIGGERS.NewDynamicsAccount, {
      condition: 'updated',
    });

    expect(requests.length).toBeGreaterThan(0);
    requests.forEach((params) => {
      expect(params.$orderby).toBe('modifiedon desc');
    });
  });
});
