// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

// The verdict of a schema command: no runtime dependencies, as the app catalogue loads it too.

/**
 * Exit status of a schema command whose schema the catalogue refused: the schema is invalid, incompatible with the
 * catalogue's contract, or the Qore runtime refused the actions it defines.  A caller must not use the schema.
 */
export const EXIT_REFUSED = 2;

/**
 * Exit status of a schema command that could not verify a schema (EX_TEMPFAIL): the Qore runtime did not finish
 * within its bound, was killed, could not start or reported no result.  Nothing is known about whether the catalogue
 * accepts the schema; trying again, for example on a less loaded host, may verify it.
 */
export const EXIT_UNVERIFIED = 75;

/** A schema the catalogue refuses. */
export class SchemaRefusedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaRefusedError';
  }
}

/** A schema that could not be verified; its message starts with APP-SCHEMA-UNVERIFIED. */
export class SchemaUnverifiedError extends Error {
  constructor(message: string) {
    super(`APP-SCHEMA-UNVERIFIED: ${message}`);
    this.name = 'SchemaUnverifiedError';
  }
}

/** Returns the exit status of a schema command that ended with the given error. */
export function exitStatus(error: unknown): number {
  if (error instanceof SchemaRefusedError) return EXIT_REFUSED;
  if (error instanceof SchemaUnverifiedError) return EXIT_UNVERIFIED;
  return 1;
}

/**
 * Returns the exit status of a command that handled several applications: refused if any schema was refused, as that
 * is a verdict; otherwise unverified only if every failure was unverified.
 */
export function combinedExitStatus(errors: unknown[]): number {
  if (!errors.length) return 0;
  const statuses = errors.map(exitStatus);
  if (statuses.includes(EXIT_REFUSED)) return EXIT_REFUSED;
  return statuses.every(status => status === EXIT_UNVERIFIED) ? EXIT_UNVERIFIED : 1;
}
