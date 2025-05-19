import { Debugger } from '../../utils/Debugger';
import {
  DEFAULT_TRIGGER_POLLING_INTERVAL,
  DEFAULT_TRIGGER_SAVED_ITEMS_LIMIT_MAX,
} from '../constants';

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

/**
 * Polls for newly created items and triggers an update function for each new item.
 *
 * @template ItemType - The type of the items being polled.
 * @param opts - The options for the polling function.
 * @param opts.trigger_name - The name of the trigger.
 * @param opts.uniqueField - The unique field of the item to identify new items.
 * @param opts.getItems - A function that returns a promise resolving to an array of items.
 * @param opts.update - A function that is called with each new item.
 * @param opts.should_stop - A function that returns a boolean indicating whether to stop polling.
 *
 * @returns A promise that resolves when the polling stops.
 *
 * @throws Will throw an error if there is an issue during polling.
 */
export const pollCreatedItemsForTrigger = async <ItemType extends Record<string, any>>(opts: {
  trigger_name: string;
  uniqueField: keyof ItemType;
  getItems: () => Promise<ItemType[]>;
  updateLastPollTime?: (lastPoll: Date) => void;
  update: (data: ItemType) => void;
  should_stop: () => boolean;
}) => {
  const { trigger_name, getItems, update, should_stop, uniqueField, updateLastPollTime } = opts;

  try {
    const initialItems = await getItems();
    let processedItems = new Set(initialItems.map((item) => item[uniqueField]));

    while (!should_stop()) {
      const latestItems = await getItems();
      latestItems.reverse();

      for (const item of latestItems) {
        if (!processedItems.has(item[uniqueField])) {
          update(item);
          processedItems.add(item[uniqueField]);
        }
      }

      if (processedItems.size > DEFAULT_TRIGGER_SAVED_ITEMS_LIMIT_MAX) {
        processedItems = new Set(
          Array.from(processedItems).slice(-DEFAULT_TRIGGER_SAVED_ITEMS_LIMIT_MAX)
        );
      }

      if (updateLastPollTime) {
        updateLastPollTime(new Date());
      }
      await delayOrCancel(DEFAULT_TRIGGER_POLLING_INTERVAL, should_stop);
    }
  } catch (error) {
    Debugger.log(`Error during polling data for trigger: ${trigger_name}`, error);
  }
};

/**
 * Polls updated items for a specified trigger and performs an update action on each updated item.
 *
 * @template ItemType - The type of the items being polled.
 * @param {Object} opts - The options for the polling function.
 * @param {string} opts.trigger_name - The name of the trigger.
 * @param {keyof ItemType} opts.uniqueField - The unique field of the item used to identify it.
 * @param {keyof ItemType} opts.updatedDateField - The field of the item that contains the date of update.
 * @param {() => Promise<ItemType[]>} opts.getItems - A function that retrieves the items to be polled.
 * @param {(data: ItemType) => void} opts.update - A function that performs an update action on an item.
 * @param {() => boolean} opts.should_stop - A function that determines whether the polling should stop.
 *
 * @returns {Promise<void>} A promise that resolves when the polling stops.
 *
 * @throws Will throw an error if there is an issue during the polling process.
 */
export const pollUpdatedItemsForTrigger = async <ItemType extends Record<string, any>>(opts: {
  trigger_name: string;
  uniqueField: keyof ItemType;
  updatedDateField: keyof ItemType;
  getItems: () => Promise<ItemType[]>;
  update: (data: ItemType) => void;
  should_stop: () => boolean;
}) => {
  const { trigger_name, getItems, update, should_stop, uniqueField, updatedDateField } = opts;

  const lastSeenEdits = new Map();

  try {
    const initialItems = await getItems();

    for (const item of initialItems) {
      const initialTime = new Date(item[updatedDateField]).getTime();
      lastSeenEdits.set(item[uniqueField], initialTime);
    }

    while (!should_stop()) {
      const latestItems = await getItems();
      latestItems.reverse();

      for (const item of latestItems) {
        const previousEditTime = lastSeenEdits.get(item[uniqueField]);
        const newEditTime = new Date(item[updatedDateField]).getTime();
        if (!previousEditTime || newEditTime > previousEditTime) {
          update(item);
          lastSeenEdits.set(item[uniqueField], newEditTime);
        }
      }

      if (lastSeenEdits.size > DEFAULT_TRIGGER_SAVED_ITEMS_LIMIT_MAX) {
        const sortedEntries = Array.from(lastSeenEdits.entries()).sort((a, b) => a[1] - b[1]);
        const toKeep = sortedEntries.slice(-DEFAULT_TRIGGER_SAVED_ITEMS_LIMIT_MAX);
        lastSeenEdits.clear();
        for (const [id, time] of toKeep) {
          lastSeenEdits.set(id, time);
        }
      }

      await delayOrCancel(DEFAULT_TRIGGER_POLLING_INTERVAL, should_stop);
    }
  } catch (error) {
    Debugger.log(`Error during polling data for trigger: ${trigger_name}`, error);
  }
};
