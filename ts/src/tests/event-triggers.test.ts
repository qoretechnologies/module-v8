import {
  pollCreatedItemsForTrigger,
  pollUpdatedItemsForTrigger,
} from '../global/helpers/event-triggers';
import { withCheckpointSupport } from '../ActionsCatalogue';
import {
  getTriggerCheckpoint,
  ITriggerCheckpoint,
  runWithTriggerCheckpoint,
} from '../global/helpers/trigger-checkpoint';

jest.mock('../global/constants', () => ({
  ...jest.requireActual('../global/constants'),
  // keep the tests fast: the real interval is 10 minutes
  DEFAULT_TRIGGER_POLLING_INTERVAL: 5,
}));

interface ITestItem extends Record<string, any> {
  id: string;
  created: number;
  updated?: string;
}

/** A checkpoint API that also exposes what it stored, so a test can assert on it. */
type TTestCheckpoint = ITriggerCheckpoint & {
  saved: Record<string, any>[];
  state?: Record<string, any>;
};

/**
 * A checkpoint API backed by memory, standing in for the host's durable storage.
 *
 * @param initial - the state a previous run left behind, if any.
 * @param trace - optional log that records when a store happens, so a test can assert the order of
 * delivery against storage rather than only that both occurred.
 */
const makeCheckpoint = (
  initial?: Record<string, any>,
  trace?: string[]
): TTestCheckpoint => {
  const cp: TTestCheckpoint = {
    state: initial,
    saved: [],
    get: () => cp.state,
    set: async (state: Record<string, any>) => {
      trace?.push('stored');
      cp.state = state;
      cp.saved.push(state);
    },
  };

  return cp;
};

describe('pollCreatedItemsForTrigger', () => {
  it('delivers items oldest-first from a newest-first page', async () => {
    const delivered: string[] = [];
    let polls = 0;

    await pollCreatedItemsForTrigger<ITestItem>({
      trigger_name: 'test',
      uniqueField: 'id',
      // newest first, as a "latest N" API returns
      getItems: async () => {
        polls++;
        return [
          { id: 'c', created: 30 },
          { id: 'b', created: 20 },
          { id: 'a', created: 10 },
        ];
      },
      update: (item) => {
        delivered.push(item.id);
      },
      should_stop: () => polls > 1,
    });

    // the first getItems() establishes the baseline, so nothing is delivered without a checkpoint
    expect(delivered).toEqual([]);
  });

  it('delivers new items oldest-first once a baseline exists', async () => {
    const delivered: string[] = [];
    let polls = 0;
    let page: ITestItem[] = [{ id: 'a', created: 10 }];

    await pollCreatedItemsForTrigger<ITestItem>({
      trigger_name: 'test',
      uniqueField: 'id',
      getItems: async () => {
        // the baseline sees only 'a'; two newer items appear afterwards, newest first
        const result = page;
        polls++;
        page = [
          { id: 'c', created: 30 },
          { id: 'b', created: 20 },
          { id: 'a', created: 10 },
        ];
        return result;
      },
      update: (item) => {
        delivered.push(item.id);
      },
      should_stop: () => polls > 2,
    });

    expect(delivered).toEqual(['b', 'c']);
  });

  it('sorts by an explicit ordering key rather than assuming newest-first', async () => {
    const delivered: string[] = [];
    let polls = 0;

    await pollCreatedItemsForTrigger<ITestItem>({
      trigger_name: 'test',
      uniqueField: 'id',
      orderKey: (item) => item.created,
      // deliberately unordered: reversing this page would not produce ascending order
      getItems: async () =>
        polls++ === 0
          ? []
          : [
              { id: 'b', created: 20 },
              { id: 'c', created: 30 },
              { id: 'a', created: 10 },
            ],
      update: (item) => {
        delivered.push(item.id);
      },
      should_stop: () => polls > 2,
    });

    expect(delivered).toEqual(['a', 'b', 'c']);
  });

  it('awaits an asynchronous update so events keep their order', async () => {
    const delivered: string[] = [];
    let polls = 0;
    const delays: Record<string, number> = { a: 30, b: 10, c: 1 };

    await pollCreatedItemsForTrigger<ITestItem>({
      trigger_name: 'test',
      uniqueField: 'id',
      getItems: async () =>
        polls++ === 0
          ? []
          : [
              { id: 'c', created: 30 },
              { id: 'b', created: 20 },
              { id: 'a', created: 10 },
            ],
      // the slowest item is the oldest: without awaiting, it would be delivered last
      update: async (item) => {
        await new Promise((resolve) => setTimeout(resolve, delays[item.id]));
        delivered.push(item.id);
      },
      should_stop: () => polls > 2,
    });

    expect(delivered).toEqual(['a', 'b', 'c']);
  });

  it('keeps polling after an item fails, and retries that item', async () => {
    const delivered: string[] = [];
    let polls = 0;
    let failed = false;

    await pollCreatedItemsForTrigger<ITestItem>({
      trigger_name: 'test',
      uniqueField: 'id',
      getItems: async () =>
        polls++ === 0
          ? []
          : [
              { id: 'b', created: 20 },
              { id: 'a', created: 10 },
            ],
      update: (item) => {
        if (item.id === 'a' && !failed) {
          failed = true;
          throw new Error('transient delivery failure');
        }
        delivered.push(item.id);
      },
      should_stop: () => polls > 4,
    });

    // the failure ended its cycle without recording 'a' as delivered, and polling continued, so both
    // items are delivered in order on a later cycle
    expect(failed).toBe(true);
    expect(delivered).toEqual(['a', 'b']);
  });

  it('keeps polling after getItems() fails', async () => {
    const delivered: string[] = [];
    let polls = 0;
    let threw = false;

    await pollCreatedItemsForTrigger<ITestItem>({
      trigger_name: 'test',
      uniqueField: 'id',
      getItems: async () => {
        const cycle = polls++;
        if (cycle === 1 && !threw) {
          threw = true;
          throw new Error('upstream unavailable');
        }
        return cycle === 0 ? [] : [{ id: 'a', created: 10 }];
      },
      update: (item) => {
        delivered.push(item.id);
      },
      should_stop: () => polls > 4,
    });

    expect(threw).toBe(true);
    expect(delivered).toEqual(['a']);
  });

  it('resumes from a durable checkpoint instead of re-baselining', async () => {
    const delivered: string[] = [];
    let polls = 0;
    const checkpoint = makeCheckpoint({ version: 1, delivered: ['a'] });

    await runWithTriggerCheckpoint(checkpoint, () =>
      pollCreatedItemsForTrigger<ITestItem>({
        trigger_name: 'test',
        uniqueField: 'id',
        // 'b' arrived while the trigger was down; without the checkpoint it would be baselined away
        getItems: async () => {
          polls++;
          return [
            { id: 'b', created: 20 },
            { id: 'a', created: 10 },
          ];
        },
        update: (item) => {
          delivered.push(item.id);
        },
        should_stop: () => polls > 1,
      })
    );

    expect(delivered).toEqual(['b']);
    expect(checkpoint.saved.at(-1)).toEqual({ version: 1, delivered: ['a', 'b'] });
  });

  it('stores a checkpoint only after the item has been delivered', async () => {
    // both the delivery and the store append here, so the assertion sees their real relative order:
    // storing a position first would mean a failure loses the item it covers
    const order: string[] = [];
    let polls = 0;
    const checkpoint = makeCheckpoint({ version: 1, delivered: [] }, order);

    await runWithTriggerCheckpoint(checkpoint, () =>
      pollCreatedItemsForTrigger<ITestItem>({
        trigger_name: 'test',
        uniqueField: 'id',
        getItems: async () => {
          polls++;
          return [
            { id: 'a', created: 10 },
            { id: 'b', created: 20 },
          ];
        },
        update: (item) => {
          order.push(`delivered:${item.id}`);
        },
        should_stop: () => polls > 1,
      })
    );

    // note the page is reversed, so 'b' is delivered first
    expect(order).toEqual(['delivered:b', 'stored', 'delivered:a', 'stored']);
    expect(checkpoint.saved).toHaveLength(2);
  });

  it('does not store a checkpoint for an item whose delivery failed', async () => {
    let polls = 0;
    const checkpoint = makeCheckpoint({ version: 1, delivered: [] });

    await runWithTriggerCheckpoint(checkpoint, () =>
      pollCreatedItemsForTrigger<ITestItem>({
        trigger_name: 'test',
        uniqueField: 'id',
        getItems: async () => {
          polls++;
          return [{ id: 'a', created: 10 }];
        },
        update: () => {
          throw new Error('delivery failed');
        },
        should_stop: () => polls > 1,
      })
    );

    expect(checkpoint.saved).toHaveLength(0);
    expect(checkpoint.state).toEqual({ version: 1, delivered: [] });
  });

  it('survives a checkpoint storage failure without stopping delivery', async () => {
    const delivered: string[] = [];
    let polls = 0;
    const checkpoint: ITriggerCheckpoint = {
      get: () => ({ version: 1, delivered: [] }),
      set: async () => {
        throw new Error('checkpoint storage unavailable');
      },
    };

    await runWithTriggerCheckpoint(checkpoint, () =>
      pollCreatedItemsForTrigger<ITestItem>({
        trigger_name: 'test',
        uniqueField: 'id',
        getItems: async () => {
          polls++;
          return [
            { id: 'b', created: 20 },
            { id: 'a', created: 10 },
          ];
        },
        update: (item) => {
          delivered.push(item.id);
        },
        should_stop: () => polls > 1,
      })
    );

    // a checkpoint that cannot be stored costs re-delivery after a restart, never a lost item
    expect(delivered).toEqual(['a', 'b']);
  });

  it('works unchanged when the host provides no checkpoint', async () => {
    const delivered: string[] = [];
    let polls = 0;

    await pollCreatedItemsForTrigger<ITestItem>({
      trigger_name: 'test',
      uniqueField: 'id',
      getItems: async () => (polls++ === 0 ? [] : [{ id: 'a', created: 10 }]),
      update: (item) => {
        delivered.push(item.id);
      },
      should_stop: () => polls > 2,
    });

    expect(delivered).toEqual(['a']);
  });
});

describe('pollUpdatedItemsForTrigger', () => {
  it('delivers edits oldest-first and resumes from a checkpoint', async () => {
    const delivered: string[] = [];
    let polls = 0;
    const checkpoint = makeCheckpoint({ version: 1, edits: [['a', 1000]] });

    await runWithTriggerCheckpoint(checkpoint, () =>
      pollUpdatedItemsForTrigger<ITestItem>({
        trigger_name: 'test',
        uniqueField: 'id',
        updatedDateField: 'updated',
        getItems: async () => {
          polls++;
          return [
            { id: 'c', created: 0, updated: new Date(3000).toISOString() },
            { id: 'a', created: 0, updated: new Date(2000).toISOString() },
            { id: 'b', created: 0, updated: new Date(1500).toISOString() },
          ];
        },
        update: (item) => {
          delivered.push(item.id);
        },
        should_stop: () => polls > 1,
      })
    );

    // 'a' was last seen at 1000 and has since been edited, so it is delivered again; ordering is by
    // edit time, so the oldest edit comes first
    expect(delivered).toEqual(['b', 'a', 'c']);
  });

  it('keeps polling after an update fails', async () => {
    const delivered: string[] = [];
    let polls = 0;
    let failed = false;

    await pollUpdatedItemsForTrigger<ITestItem>({
      trigger_name: 'test',
      uniqueField: 'id',
      updatedDateField: 'updated',
      getItems: async () =>
        polls++ === 0 ? [] : [{ id: 'a', created: 0, updated: new Date(2000).toISOString() }],
      update: (item) => {
        if (!failed) {
          failed = true;
          throw new Error('transient failure');
        }
        delivered.push(item.id);
      },
      should_stop: () => polls > 4,
    });

    expect(failed).toBe(true);
    expect(delivered).toEqual(['a']);
  });
});

describe('withCheckpointSupport', () => {
  const makeAction = (event_function: any): any => ({
    app: 'test',
    action: 'test',
    action_code: 1,
    event_function,
  });

  it('propagates the return value of an async event function', async () => {
    // the Qore side awaits the returned promise; discarding it would let the host treat the event
    // function as already finished and would swallow a rejection
    let finished = false;
    const wrapped: any = withCheckpointSupport(
      makeAction(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        finished = true;
        return 'result';
      })
    );

    const returned = wrapped.event_function({}, () => {}, () => false, undefined);

    expect(returned).toBeInstanceOf(Promise);
    expect(finished).toBe(false);
    await expect(returned).resolves.toBe('result');
    expect(finished).toBe(true);
  });

  it('propagates a rejection rather than swallowing it', async () => {
    const wrapped: any = withCheckpointSupport(
      makeAction(async () => {
        throw new Error('event function failed');
      })
    );

    await expect(
      wrapped.event_function({}, () => {}, () => false, undefined)
    ).rejects.toThrow('event function failed');
  });

  it('publishes the checkpoint to the event function and anything it calls', async () => {
    const checkpoint = makeCheckpoint({ version: 1, delivered: ['x'] });
    let seenInside: any;
    let seenAfterAwait: any;

    const wrapped: any = withCheckpointSupport(
      makeAction(async () => {
        seenInside = getTriggerCheckpoint();
        await new Promise((resolve) => setTimeout(resolve, 5));
        // the store must still resolve after an await, since a poller reads it deep in its own stack
        seenAfterAwait = getTriggerCheckpoint();
      })
    );

    await wrapped.event_function({}, () => {}, () => false, checkpoint);

    expect(seenInside).toBe(checkpoint);
    expect(seenAfterAwait).toBe(checkpoint);
  });

  it('leaves an action without an event function untouched', () => {
    const action: any = { app: 'test', action: 'test', action_code: 0 };

    expect(withCheckpointSupport(action)).toBe(action);
  });

  it('ignores a fourth argument that is not a checkpoint API', async () => {
    let seen: any = 'unset';
    const wrapped: any = withCheckpointSupport(
      makeAction(async () => {
        seen = getTriggerCheckpoint();
      })
    );

    await wrapped.event_function({}, () => {}, () => false, { bogus: true });

    expect(seen).toBeUndefined();
  });
});
