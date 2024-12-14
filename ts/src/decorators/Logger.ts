import { Debugger, DebugLevels } from '../utils/Debugger';

/**
 * Logs a message to the console with the specified level
 * @param {string} [message] - The message to log.
 * @param {DebugLevels} level - The level of the log message.
 * @returns A property descriptor.
 */
export function Log(
  message: string,
  level: DebugLevels = DebugLevels.Info
): (target: any, propertyKey: string, description: PropertyDescriptor) => PropertyDescriptor {
  return (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      Debugger.log(message, args, level);

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
