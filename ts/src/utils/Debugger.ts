export enum DebugLevels {
  None = 0,
  Info = 1,
  Verbose = 2,
}

class _Debugger {
  #level: number = DebugLevels.None;

  set level(level: DebugLevels) {
    this.#level = level;
  }

  get level(): DebugLevels {
    return this.#level;
  }

  /**
   * It logs a message to the console with the info level.
   * @param {string} message - The message to log.
   */
  info(message: string): void {
    this.log(message, DebugLevels.Info);
  }

  /**
   * Prints a message to the console if the current debug level is Verbose
   * @param {string} message - The message to log.
   */
  verbose(message: string): void {
    this.log(message, DebugLevels.Verbose);
  }

  /**
   * If the level is less than or equal to the current level, then log the message
   * @param {string} message - The message to log.
   * @param {DebugLevels} level - The minimum level of the message to be logged.
   */
  log(message: string, args?: any, level: DebugLevels = DebugLevels.Info): void {
    if (level <= this.#level) {
      console.log(message);
      console.log(args);
    }
  }
}

export interface IDebugger extends _Debugger {}
export const Debugger: IDebugger = new _Debugger();
