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

/**
 * Exit status of a schema command whose schema source could not be reached or did not answer (EX_UNAVAILABLE): the
 * connection failed or was closed, no complete response arrived within the bound, or the source answered HTTP 408,
 * 429 or 5xx.  Nothing was downloaded completely, so nothing was verified or changed; the source may answer later.
 * Any other HTTP status is an error (exit status 1), as the same request would get it again.
 */
export const EXIT_UNAVAILABLE = 69;

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

/** A schema source that could not be reached or did not answer; its message names the source's URL. */
export class SchemaSourceUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaSourceUnavailableError';
  }
}

/** Returns the exit status of a schema command that ended with the given error. */
export function exitStatus(error: unknown): number {
  if (error instanceof SchemaRefusedError) return EXIT_REFUSED;
  if (error instanceof SchemaUnverifiedError) return EXIT_UNVERIFIED;
  if (error instanceof SchemaSourceUnavailableError) return EXIT_UNAVAILABLE;
  return 1;
}

/**
 * Returns the exit status of a command that handled several applications: refused if any schema was refused, as that
 * is a verdict; otherwise the status of every failure if they all have the same one (unverified or unavailable), and
 * 1 for a mix.
 */
export function combinedExitStatus(errors: unknown[]): number {
  if (!errors.length) return 0;
  const statuses = errors.map(exitStatus);
  if (statuses.includes(EXIT_REFUSED)) return EXIT_REFUSED;
  return statuses.every(status => status === statuses[0]) ? statuses[0] : 1;
}
