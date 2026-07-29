import { AsyncLocalStorage } from 'node:async_hooks';
import { Debugger } from '../../utils/Debugger';

/**
 * The durable checkpoint API handed to an event function by the Qore side.
 *
 * A checkpoint lets a trigger keep its position in an upstream feed across a host reload. Without one, a
 * restarted trigger has to establish a fresh baseline from whatever the upstream currently returns, which
 * silently skips everything that arrived while it was not running.
 */
export interface ITriggerCheckpoint {
  /** Returns the state stored by the previous run, or `undefined` if there is none. */
  get: <T = Record<string, any>>() => T | undefined;
  /**
   * Durably stores the replacement state.
   *
   * Only store a position **after** the item it covers has been delivered. Storing it first means a
   * failure loses the item; storing it afterwards means a failure re-delivers it, which is the
   * at-least-once guarantee the checkpoint exists to provide.
   */
  set: (state: Record<string, any>) => Promise<void> | void;
}

/**
 * The checkpoint API for the event function running on the current async call stack.
 *
 * Qore passes the checkpoint API as the fourth argument to an event function. Rather than requiring every
 * trigger to declare and thread that argument through to its polling helper, the action registration wraps
 * each event function and publishes the API here for the duration of the call. `AsyncLocalStorage` keeps it
 * correct when several event sources run concurrently in one JavaScript program: each invocation gets its
 * own store, and the store follows the call across `await` boundaries.
 */
const checkpointStorage = new AsyncLocalStorage<ITriggerCheckpoint>();

/**
 * Runs an event function with the given checkpoint API published for the duration of the call.
 *
 * @param checkpoint - the checkpoint API supplied by the Qore side, if any.
 * @param fn - the event function invocation to run.
 */
export const runWithTriggerCheckpoint = <T>(
  checkpoint: ITriggerCheckpoint | undefined,
  fn: () => T
): T => {
  if (!checkpoint) {
    return fn();
  }

  return checkpointStorage.run(checkpoint, fn);
};

/**
 * Returns the checkpoint API for the running event function, if the host provides one.
 *
 * Returns `undefined` when no host checkpoint callback is configured, in which case a trigger keeps
 * in-memory state only and re-baselines on restart.
 */
export const getTriggerCheckpoint = (): ITriggerCheckpoint | undefined => checkpointStorage.getStore();

/**
 * Returns `true` if the given value looks like a checkpoint API.
 *
 * The value crosses the Qore/JavaScript boundary, so it is validated rather than trusted.
 */
export const isTriggerCheckpoint = (value: unknown): value is ITriggerCheckpoint =>
  !!value &&
  typeof (value as ITriggerCheckpoint).get === 'function' &&
  typeof (value as ITriggerCheckpoint).set === 'function';

/**
 * Stores a checkpoint without letting a storage failure interrupt event delivery.
 *
 * A checkpoint that is not stored costs re-delivery of already-delivered items after a restart, never a
 * lost item, so a failure here is logged and polling continues.
 *
 * @param trigger_name - the trigger name, for diagnostics.
 * @param state - the state to store.
 */
export const saveTriggerCheckpoint = async (
  trigger_name: string,
  state: Record<string, any>
): Promise<void> => {
  const checkpoint = getTriggerCheckpoint();

  if (!checkpoint) {
    return;
  }

  try {
    await checkpoint.set(state);
  } catch (error) {
    Debugger.log(
      `Could not store the delivery checkpoint for trigger: ${trigger_name}; items already delivered may be delivered again after a restart`,
      error
    );
  }
};

/**
 * Returns the state stored by the previous run of the current trigger, if any.
 *
 * @param trigger_name - the trigger name, for diagnostics.
 */
export const loadTriggerCheckpoint = <T = Record<string, any>>(
  trigger_name: string
): T | undefined => {
  const checkpoint = getTriggerCheckpoint();

  if (!checkpoint) {
    return undefined;
  }

  try {
    return checkpoint.get<T>();
  } catch (error) {
    Debugger.log(`Could not read the delivery checkpoint for trigger: ${trigger_name}`, error);
    return undefined;
  }
};
