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
  /** the trigger's `keyVersion` when the checkpoint was stored, if it states one */
  keyVersion?: number;
  /** the unique values of the items already delivered */
  delivered: (string | number)[];
}

/** The checkpoint envelope stored by {@link pollUpdatedItemsForTrigger}. */
interface IUpdatedItemsCheckpoint {
  version: 1;
  /** the trigger's `keyVersion` when the checkpoint was stored, if it states one */
  keyVersion?: number;
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
 * Whether a restored checkpoint was stored under the unique key the trigger now uses.
 *
 * A checkpoint holds the unique values of the items already delivered. When a trigger changes the field it
 * takes those values from (say from a meeting's number to the UUID of its instance), nothing the feed now
 * returns matches the stored values, and resuming from them would report every current item as new. A
 * trigger states its key with `keyVersion`; a checkpoint stored under a different one, or under none, is
 * discarded in favor of a fresh baseline, exactly as on a first start.
 */
const checkpointKeyMatches = (
  restored: { keyVersion?: number },
  keyVersion: number | undefined
): boolean => restored.keyVersion === keyVersion;

/** The `keyVersion` part of a checkpoint envelope: present only when the trigger states one. */
const keyVersionOf = (keyVersion: number | undefined): { keyVersion?: number } =>
  keyVersion === undefined ? {} : { keyVersion };

/** Why a stored checkpoint is not resumed from, for the log. */
const describeDiscardedCheckpoint = (
  trigger_name: string,
  recognized: boolean,
  restored: { keyVersion?: number },
  keyVersion: number | undefined
): string =>
  recognized
    ? `Not resuming trigger ${trigger_name} from its stored checkpoint: it was stored under unique key version ${restored.keyVersion ?? 'none'} and the trigger now uses ${keyVersion ?? 'none'}; taking a fresh baseline`
    : `Not resuming trigger ${trigger_name} from its stored checkpoint: the stored state is not recognized; taking a fresh baseline`;

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
 * @param opts.keyVersion - The version of the unique key, for a trigger that has ever changed the field
 * it takes the key from; a checkpoint stored under another version is discarded and a fresh baseline
 * taken, so that the change does not replay every current item as new.
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
  keyVersion?: number;
  updateLastPollTime?: (lastPoll: Date) => void;
  update: (data: ItemType) => void | Promise<void>;
  should_stop: () => boolean;
}) => {
  const {
    trigger_name,
    getItems,
    update,
    should_stop,
    uniqueField,
    orderKey,
    keyVersion,
    updateLastPollTime,
  } = opts;

  let delivered = new Set<string | number>();

  const checkpointOf = (): ICreatedItemsCheckpoint => ({
    version: 1,
    ...keyVersionOf(keyVersion),
    delivered: Array.from(pruneDelivered(delivered)),
  });

  try {
    const restored = loadTriggerCheckpoint<ICreatedItemsCheckpoint>(trigger_name);
    const recognized = restored?.version === 1 && Array.isArray(restored.delivered);

    if (recognized && checkpointKeyMatches(restored, keyVersion)) {
      // resume where the previous run stopped, so items that arrived while the trigger was down are
      // still delivered rather than silently treated as already handled
      delivered = new Set(restored.delivered);
    } else {
      if (restored) {
        Debugger.log(describeDiscardedCheckpoint(trigger_name, recognized, restored, keyVersion));
      }

      // no usable durable position: establish a baseline so that a first start does not replay the whole
      // feed, and store it, so that a restart before the first delivery resumes from it (and so that a
      // checkpoint stored under an old key is replaced)
      const initialItems = await getItems();
      delivered = new Set(initialItems.map((item) => item[uniqueField]));
      await saveTriggerCheckpoint(trigger_name, checkpointOf());
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
        await saveTriggerCheckpoint(trigger_name, checkpointOf());
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
 * @param opts.keyVersion - The version of the unique key; see {@link pollCreatedItemsForTrigger}.
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
  keyVersion?: number;
  update: (data: ItemType) => void | Promise<void>;
  should_stop: () => boolean;
}) => {
  const { trigger_name, getItems, update, should_stop, uniqueField, updatedDateField, keyVersion } =
    opts;

  let lastSeenEdits = new Map<string | number, number>();

  const getEditTime = (item: ItemType): number => new Date(get(item, updatedDateField)).getTime();

  const pruneEdits = (edits: Map<string | number, number>): Map<string | number, number> => {
    if (edits.size <= DEFAULT_TRIGGER_SAVED_ITEMS_LIMIT_MAX) {
      return edits;
    }

    const sortedEntries = Array.from(edits.entries()).sort((a, b) => a[1] - b[1]);

    return new Map(sortedEntries.slice(-DEFAULT_TRIGGER_SAVED_ITEMS_LIMIT_MAX));
  };

  const checkpointOf = (): IUpdatedItemsCheckpoint => ({
    version: 1,
    ...keyVersionOf(keyVersion),
    edits: Array.from(pruneEdits(lastSeenEdits).entries()),
  });

  try {
    const restored = loadTriggerCheckpoint<IUpdatedItemsCheckpoint>(trigger_name);
    const recognized = restored?.version === 1 && Array.isArray(restored.edits);

    if (recognized && checkpointKeyMatches(restored, keyVersion)) {
      lastSeenEdits = new Map(restored.edits);
    } else {
      if (restored) {
        Debugger.log(describeDiscardedCheckpoint(trigger_name, recognized, restored, keyVersion));
      }

      const initialItems = await getItems();

      for (const item of initialItems) {
        lastSeenEdits.set(item[uniqueField], getEditTime(item));
      }

      await saveTriggerCheckpoint(trigger_name, checkpointOf());
    }
  } catch (error) {
    Debugger.log(`Error establishing the initial position for trigger: ${trigger_name}`, error);
  }

  while (!should_stop()) {
    try {
      const latestItems = await getItems();

      // oldest edit first, so a failure part-way through leaves only newer edits undelivered
      const ordered = [...latestItems].sort(
        (left, right) => getEditTime(left) - getEditTime(right)
      );

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
        await saveTriggerCheckpoint(trigger_name, checkpointOf());
      }

      lastSeenEdits = pruneEdits(lastSeenEdits);
    } catch (error) {
      Debugger.log(`Error during polling data for trigger: ${trigger_name}`, error);
    }

    await delayOrCancel(DEFAULT_TRIGGER_POLLING_INTERVAL, should_stop);
  }
};
