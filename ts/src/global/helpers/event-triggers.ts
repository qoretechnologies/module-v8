import { get } from 'lodash';
import { Debugger } from '../../utils/Debugger';
import {
  DEFAULT_TRIGGER_POLLING_INTERVAL,
  DEFAULT_TRIGGER_SAVED_ITEMS_LIMIT_MAX,
} from '../constants';
import { loadTriggerCheckpoint, saveTriggerCheckpoint } from './trigger-checkpoint';

/**
 * Waits for a specified amount of time or until a stopping condition is met, whichever comes first.
 *
 * @param ms - The number of milliseconds to wait before resolving the promise.
 * @param shouldStop - A function that returns a boolean indicating whether the waiting should be stopped.
 * @returns A promise that resolves when either the specified time has passed or the stopping condition is met.
 */
export const delayOrCancel = (ms: number, shouldStop: () => boolean): Promise<void> =>
  Promise.race([
    new Promise<void>((resolve) => {
      const timeoutId = setTimeout(() => {
        clearInterval(checkIntervalId);
        resolve();
      }, ms);
      const checkIntervalId = setInterval(() => {
        if (shouldStop()) {
          clearTimeout(timeoutId);
          clearInterval(checkIntervalId);
          resolve();
        }
      }, 50);
    }),
  ]);

/** The checkpoint envelope stored by {@link pollCreatedItemsForTrigger}. */
interface ICreatedItemsCheckpoint {
  version: 1;
  /** the unique values of the items already delivered */
  delivered: (string | number)[];
}

/** The checkpoint envelope stored by {@link pollUpdatedItemsForTrigger}. */
interface IUpdatedItemsCheckpoint {
  version: 1;
  /** the last delivered edit time, by unique value */
  edits: [string | number, number][];
}

/**
 * Orders a page of items oldest-first.
 *
 * Without an `orderKey` the page is simply reversed, which is the long-standing behavior and assumes the
 * upstream API returns items newest-first. That assumption cannot be verified here, so a trigger whose
 * feed carries a usable ordering key should supply one and get an actual guarantee instead.
 */
const orderOldestFirst = <ItemType extends Record<string, any>>(
  items: ItemType[],
  orderKey?: (item: ItemType) => number | string
): ItemType[] => {
  if (!orderKey) {
    return [...items].reverse();
  }

  return [...items].sort((left, right) => {
    const a = orderKey(left);
    const b = orderKey(right);

    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });
};

/** Drops the least recently added entries once the delivered set outgrows its bound. */
const pruneDelivered = (delivered: Set<string | number>): Set<string | number> => {
  if (delivered.size <= DEFAULT_TRIGGER_SAVED_ITEMS_LIMIT_MAX) {
    return delivered;
  }

  // JavaScript sets keep insertion order, so the trailing entries are the most recently added
  return new Set(Array.from(delivered).slice(-DEFAULT_TRIGGER_SAVED_ITEMS_LIMIT_MAX));
};

/**
 * Polls for newly created items and triggers an update function for each new item.
 *
 * ### Delivery guarantees
 *
 * - Items are delivered oldest-first (see `orderKey`), and `update` is awaited, so a trigger that does
 *   asynchronous work per item still delivers its events in order.
 * - An item is recorded as delivered only after `update` resolves. A failure ends the current cycle
 *   without recording it, so the item is retried on the next cycle rather than skipped. Delivery is
 *   therefore at-least-once, never at-most-once.
 * - A failing cycle does not stop the trigger; only `should_stop()` ends polling.
 * - When the host provides a durable checkpoint, the set of delivered items survives a reload, so items
 *   that arrived while the trigger was down are still delivered. Without one, the first poll establishes
 *   a baseline from whatever the upstream currently returns and those items are never reported.
 *
 * @param opts - The options for the polling function.
 * @param opts.trigger_name - The name of the trigger.
 * @param opts.uniqueField - The unique field of the item to identify new items.
 * @param opts.getItems - A function that returns a promise resolving to an array of items.
 * @param opts.orderKey - Optional accessor returning an item's position in the feed; when given, items
 * are sorted ascending by it instead of the page simply being reversed.
 * @param opts.update - A function that is called with each new item; awaited if it returns a promise.
 * @param opts.should_stop - A function that returns a boolean indicating whether to stop polling.
 *
 * @returns A promise that resolves when the polling stops.
 */
export const pollCreatedItemsForTrigger = async <ItemType extends Record<string, any>>(opts: {
  trigger_name: string;
  uniqueField: keyof ItemType;
  getItems: () => Promise<ItemType[]>;
  orderKey?: (item: ItemType) => number | string;
  updateLastPollTime?: (lastPoll: Date) => void;
  update: (data: ItemType) => void | Promise<void>;
  should_stop: () => boolean;
}) => {
  const { trigger_name, getItems, update, should_stop, uniqueField, orderKey, updateLastPollTime } =
    opts;

  let delivered = new Set<string | number>();

  try {
    const restored = loadTriggerCheckpoint<ICreatedItemsCheckpoint>(trigger_name);

    if (restored?.version === 1 && Array.isArray(restored.delivered)) {
      // resume where the previous run stopped, so items that arrived while the trigger was down are
      // still delivered rather than silently treated as already handled
      delivered = new Set(restored.delivered);
    } else {
      // no durable position: establish a baseline so that a first start does not replay the whole feed
      const initialItems = await getItems();
      delivered = new Set(initialItems.map((item) => item[uniqueField]));
    }
  } catch (error) {
    Debugger.log(`Error establishing the initial position for trigger: ${trigger_name}`, error);
  }

  while (!should_stop()) {
    try {
      const latestItems = await getItems();

      for (const item of orderOldestFirst(latestItems, orderKey)) {
        if (should_stop()) {
          break;
        }

        const id = item[uniqueField];

        if (delivered.has(id)) {
          continue;
        }

        // awaited so that an asynchronous update still delivers in order, and so that a failure is
        // caught here rather than surfacing as an unhandled rejection
        await update(item);
        delivered.add(id);
        await saveTriggerCheckpoint(trigger_name, {
          version: 1,
          delivered: Array.from(pruneDelivered(delivered)),
        } satisfies ICreatedItemsCheckpoint);
      }

      delivered = pruneDelivered(delivered);

      if (updateLastPollTime) {
        updateLastPollTime(new Date());
      }
    } catch (error) {
      // end this cycle, not the trigger: items that were not delivered are still not recorded as
      // delivered, so the next cycle retries them
      Debugger.log(`Error during polling data for trigger: ${trigger_name}`, error);
    }

    await delayOrCancel(DEFAULT_TRIGGER_POLLING_INTERVAL, should_stop);
  }
};

/**
 * Polls updated items for a specified trigger and performs an update action on each updated item.
 *
 * Carries the same delivery guarantees as {@link pollCreatedItemsForTrigger}; see that function for
 * details.
 *
 * @param opts - The options for the polling function.
 * @param opts.trigger_name - The name of the trigger.
 * @param opts.uniqueField - The unique field of the item used to identify it.
 * @param opts.updatedDateField - The field of the item that contains the date of update.
 * @param opts.getItems - A function that retrieves the items to be polled.
 * @param opts.update - A function that performs an update action on an item; awaited if it returns a promise.
 * @param opts.should_stop - A function that determines whether the polling should stop.
 *
 * @returns A promise that resolves when the polling stops.
 */
export const pollUpdatedItemsForTrigger = async <ItemType extends Record<string, any>>(opts: {
  trigger_name: string;
  uniqueField: keyof ItemType;
  updatedDateField: keyof ItemType;
  getItems: () => Promise<ItemType[]>;
  update: (data: ItemType) => void | Promise<void>;
  should_stop: () => boolean;
}) => {
  const { trigger_name, getItems, update, should_stop, uniqueField, updatedDateField } = opts;

  let lastSeenEdits = new Map<string | number, number>();

  const getEditTime = (item: ItemType): number => new Date(get(item, updatedDateField)).getTime();

  const pruneEdits = (edits: Map<string | number, number>): Map<string | number, number> => {
    if (edits.size <= DEFAULT_TRIGGER_SAVED_ITEMS_LIMIT_MAX) {
      return edits;
    }

    const sortedEntries = Array.from(edits.entries()).sort((a, b) => a[1] - b[1]);

    return new Map(sortedEntries.slice(-DEFAULT_TRIGGER_SAVED_ITEMS_LIMIT_MAX));
  };

  try {
    const restored = loadTriggerCheckpoint<IUpdatedItemsCheckpoint>(trigger_name);

    if (restored?.version === 1 && Array.isArray(restored.edits)) {
      lastSeenEdits = new Map(restored.edits);
    } else {
      const initialItems = await getItems();

      for (const item of initialItems) {
        lastSeenEdits.set(item[uniqueField], getEditTime(item));
      }
    }
  } catch (error) {
    Debugger.log(`Error establishing the initial position for trigger: ${trigger_name}`, error);
  }

  while (!should_stop()) {
    try {
      const latestItems = await getItems();

      // oldest edit first, so a failure part-way through leaves only newer edits undelivered
      const ordered = [...latestItems].sort((left, right) => getEditTime(left) - getEditTime(right));

      for (const item of ordered) {
        if (should_stop()) {
          break;
        }

        const previousEditTime = lastSeenEdits.get(item[uniqueField]);
        const newEditTime = getEditTime(item);

        if (previousEditTime && newEditTime <= previousEditTime) {
          continue;
        }

        await update(item);
        lastSeenEdits.set(item[uniqueField], newEditTime);
        await saveTriggerCheckpoint(trigger_name, {
          version: 1,
          edits: Array.from(pruneEdits(lastSeenEdits).entries()),
        } satisfies IUpdatedItemsCheckpoint);
      }

      lastSeenEdits = pruneEdits(lastSeenEdits);
    } catch (error) {
      Debugger.log(`Error during polling data for trigger: ${trigger_name}`, error);
    }

    await delayOrCancel(DEFAULT_TRIGGER_POLLING_INTERVAL, should_stop);
  }
};
