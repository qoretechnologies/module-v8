// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
import { execFileSync } from 'node:child_process';
import { SchemaRefusedError, SchemaUnverifiedError } from './schema-errors';

/** Exit status of a qualification program that refused the schema; it prints {@link REFUSAL_MARKER} first. */
export const REFUSAL_STATUS = 3;

/** The line a qualification program prints before it exits with {@link REFUSAL_STATUS}, followed by the JSON error. */
export const REFUSAL_MARKER = 'APP-SNAPSHOT-REFUSED:';

/**
 * The longest one qualification run of the Qore runtime may take, in milliseconds.
 *
 * Measured on 2026-10-15 on a macOS arm64 host at a load average of 5, one application at a time: the slowest runs
 * were NetSuite's, 9.2 s (AST) and 9.1 s (tiered); HubSpot's took 4.0 s and every other application's 4.2 s or less.
 * A schema command runs two of them per application (tiered and AST), and a caller may import several applications
 * at once, so on a loaded host a run takes many times longer: NetSuite's took more than 120 s at a load average of 37
 * with four imports at once.  The bound is about 65 times the slowest measured run, so that it ends a runtime that is
 * stuck rather than one that is slow.  A run that exceeds it is reported as unverified (exit status 75), never as
 * refused.  QORE_APP_SCHEMA_QUALIFICATION_TIMEOUT_MS overrides it.
 */
export const QUALIFICATION_TIMEOUT_MS = 600000;

/** The longest `qore --module-path` may take, in milliseconds: it only prints a path (measured: 0.04 s). */
export const MODULE_PATH_TIMEOUT_MS = 60000;

/** Returns the qualification bound in milliseconds: QORE_APP_SCHEMA_QUALIFICATION_TIMEOUT_MS or the default. */
export function qualificationTimeout(): number {
  const value = process.env.QORE_APP_SCHEMA_QUALIFICATION_TIMEOUT_MS;
  if (value === undefined || value === '') return QUALIFICATION_TIMEOUT_MS;
  const timeout = Number(value);
  if (!Number.isSafeInteger(timeout) || timeout <= 0) {
    throw new Error(`QORE_APP_SCHEMA_QUALIFICATION_TIMEOUT_MS must be a positive integer, got ${JSON.stringify(value)}`);
  }
  return timeout;
}

/** Returns the module path of the installed Qore runtime, or throws {@link SchemaUnverifiedError}. */
export function qoreModulePath(env: NodeJS.ProcessEnv): string {
  try {
    return execFileSync('qore', ['--module-path'], { env, encoding: 'utf8', timeout: MODULE_PATH_TIMEOUT_MS }).trim();
  } catch (error) {
    throw new SchemaUnverifiedError(`qore --module-path: ${describeFailure(error, MODULE_PATH_TIMEOUT_MS)}`);
  }
}

/**
 * Wraps the checks of a qualification program so that a refusal is reported as one: an exception with one of the
 * given codes prints {@link REFUSAL_MARKER} and the error as JSON and exits with {@link REFUSAL_STATUS}; any other
 * exception is not a verdict on the schema and ends the program as usual.
 */
export function refusingProgram(setup: string, checks: string, codes: string[]): string {
  return `${setup}
try {
${checks}
} catch (hash<ExceptionInfo> ex) {
    if (inlist(ex.err, ${JSON.stringify(codes).replace(/^\[/, '(').replace(/\]$/, ')')})) {
        printf("${REFUSAL_MARKER}%s\\n", make_json({"err": ex.err, "desc": ex.desc}));
        exit(${REFUSAL_STATUS});
    }
    rethrow;
}`;
}

/**
 * Runs one qualification of the Qore runtime and classifies its result.
 *
 * @param label the application and mode, for messages
 * @param args the arguments of `qore`
 * @param env the environment of the runtime
 * @param confirmation the line the program prints when it confirmed every action
 * @returns the program's standard output
 * @throws SchemaRefusedError if the program refused the schema
 * @throws SchemaUnverifiedError if the runtime did not finish within {@link qualificationTimeout}, was killed, could
 * not start, failed without a refusal or did not confirm the actions
 */
export function runQualification(label: string, args: string[], env: NodeJS.ProcessEnv, confirmation: string): string {
  const timeout = qualificationTimeout();
  let output: string;
  try {
    output = execFileSync('qore', args, { env, encoding: 'utf8', timeout, maxBuffer: 8 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error) {
    const failure = error as { status?: number | null; stdout?: string };
    const refusal = failure.status === REFUSAL_STATUS ? refusalOf(failure.stdout) : undefined;
    if (refusal) throw new SchemaRefusedError(`APP-SCHEMA-QUALIFICATION: ${label}: ${refusal.err}: ${refusal.desc}`);
    throw new SchemaUnverifiedError(`${label}: ${describeFailure(error, timeout)}`);
  }
  if (!output.includes(confirmation)) {
    throw new SchemaUnverifiedError(`${label}: the Qore runtime did not confirm the expected actions`);
  }
  return output;
}

/** Returns the refusal a qualification program printed, if any. */
function refusalOf(stdout: string | undefined): { err: string; desc: string } | undefined {
  const line = (stdout ?? '').split('\n').find(text => text.startsWith(REFUSAL_MARKER));
  if (!line) return undefined;
  try {
    const value = JSON.parse(line.slice(REFUSAL_MARKER.length));
    if (typeof value?.err === 'string') return { err: value.err, desc: String(value.desc ?? '') };
  } catch {
    // not a refusal the program printed
  }
  return undefined;
}

/** Describes why a child process did not succeed. */
function describeFailure(error: unknown, timeout: number): string {
  const failure = error as { code?: string; signal?: string | null; status?: number | null; stderr?: string;
    message?: string };
  if (failure.code === 'ETIMEDOUT') return `the Qore runtime did not finish within ${timeout / 1000} s`;
  if (failure.signal) return `the Qore runtime was ended by ${failure.signal}`;
  const detail = (failure.stderr ?? '').toString().trim();
  return detail || failure.message || String(error);
}
