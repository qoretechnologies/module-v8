// Tests check-i18n.sh, the CI wrapper of the source-owned provider catalog check, with a stand-in checker.
//
// Copyright 2026 Qore Technologies, s.r.o.

import assert from "node:assert/strict";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import { afterEach, test } from "node:test";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./check-i18n.sh", import.meta.url));
const temporaryDirectories = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

/**
 * Creates a work directory with an i18n directory and a stand-in qore-data-provider-i18n on the PATH. The stand-in
 * records its arguments and environment, writes the given lines to stderr and the given summary to stdout, and exits
 * with the given status, as the real checker reports issues on stderr and exits with 2.
 */
const setUp = ({ lines = [], summary = "", status = 0 }) => {
  const work = mkdtempSync(join(tmpdir(), "module-v8-check-i18n-"));
  temporaryDirectories.push(work);
  const bin = join(work, "bin");
  const i18n = join(work, "i18n");
  mkdirSync(bin);
  mkdirSync(i18n);
  writeFileSync(join(work, "stderr.txt"), lines.map((line) => line + "\n").join(""));
  writeFileSync(join(work, "stdout.txt"), summary ? summary + "\n" : "");
  const checker = join(bin, "qore-data-provider-i18n");
  writeFileSync(
    checker,
    [
      "#!/bin/bash",
      `printf '%s\\n' "$@" > '${join(work, "args.txt")}'`,
      `env > '${join(work, "env.txt")}'`,
      `cat '${join(work, "stderr.txt")}' >&2`,
      `cat '${join(work, "stdout.txt")}'`,
      `exit ${status}`,
      "",
    ].join("\n"),
  );
  chmodSync(checker, 0o755);
  return { work, bin, i18n };
};

const run = (setup, args, env = {}) =>
  spawnSync("bash", [script, ...args], {
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${setup.bin}:${process.env.PATH}`,
      TMPDIR: setup.work,
      ...env,
    },
  });

/** Returns stale-key lines as the checker prints them for the given catalog file */
const staleLines = (file, count) =>
  Array.from({ length: count }, (_, i) => `STALE: ${file}: app.TmV0U3VpdGU.type.id${i}: display_name: message id is not present in the generated root catalog`);

test("a failed check shows the first lines, a count for each kind and file, and the complete report", () => {
  const lines = [
    "STALE: /x/i18n/data-provider.TmV0U3VpdGU/root.json",
    ...staleLines("/x/i18n/data-provider.TmV0U3VpdGU/cs.json", 5000),
    ...staleLines("/x/i18n/data-provider.TmV0U3VpdGU/de.json", 3000),
    "MISSING: /x/i18n/data-provider.QWJj/fr.json: app.QWJj.option.a: display_name: no translation",
  ];
  const setup = setUp({ lines, status: 2 });
  const report = join(setup.work, "report.txt");
  const result = run(setup, [setup.i18n, report]);

  assert.equal(result.status, 2, "the checker's status is the wrapper's status");
  const output = result.stdout.split("\n").filter((line) => line !== "");
  assert.deepEqual(output.slice(0, 20), lines.slice(0, 20), "the first 20 lines are shown as they are");
  assert.deepEqual(output.slice(20), [
    `... ${lines.length - 20} more line(s); the lines of the report by kind and catalog file:`,
    "  STALE: /x/i18n/data-provider.TmV0U3VpdGU/root.json: 1",
    "  STALE: /x/i18n/data-provider.TmV0U3VpdGU/cs.json: 5000",
    "  STALE: /x/i18n/data-provider.TmV0U3VpdGU/de.json: 3000",
    "  MISSING: /x/i18n/data-provider.QWJj/fr.json: 1",
    `the complete report (${lines.length} line(s)) is ${report}`,
  ]);
  assert.equal(result.stderr, "");
  assert.equal(readFileSync(report, "utf8"), lines.map((line) => line + "\n").join(""),
    "the report has every line of the checker's output");
});

test("a report file name ending with .gz gets the complete report compressed", () => {
  const lines = staleLines("/x/i18n/data-provider.QWJj/cs.json", 30);
  const setup = setUp({ lines, status: 2 });
  const report = join(setup.work, "report.txt.gz");
  const result = run(setup, [setup.i18n, report]);

  assert.equal(result.status, 2);
  assert.match(result.stdout, new RegExp(`^the complete report \\(30 line\\(s\\)\\) is ${report.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"));
  assert.equal(gunzipSync(readFileSync(report)).toString("utf8"), lines.map((line) => line + "\n").join(""));
  assert.equal(existsSync(join(setup.work, "report.txt")), false, "the uncompressed report is removed");
});

test("QORE_I18N_CHECK_MAX_LINES sets the number of lines shown", () => {
  const lines = staleLines("/x/i18n/data-provider.QWJj/cs.json", 10);
  const setup = setUp({ lines, status: 2 });
  const report = join(setup.work, "report.txt");
  const result = run(setup, [setup.i18n, report], { QORE_I18N_CHECK_MAX_LINES: "3" });

  assert.equal(result.status, 2);
  const output = result.stdout.split("\n").filter((line) => line !== "");
  assert.deepEqual(output, [
    ...lines.slice(0, 3),
    "... 7 more line(s); the lines of the report by kind and catalog file:",
    "  STALE: /x/i18n/data-provider.QWJj/cs.json: 10",
    `the complete report (10 line(s)) is ${report}`,
  ]);

  const invalid = run(setup, [setup.i18n, report], { QORE_I18N_CHECK_MAX_LINES: "ten" });
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /QORE_I18N_CHECK_MAX_LINES must be a non-negative integer; got "ten"/);
});

test("a passing check shows the checker's output and runs it on a sanitized environment", () => {
  const summary = "verified 81 owner module(s), 81 domain(s), 652224 translation(s)";
  const setup = setUp({ summary, status: 0 });
  const result = run(setup, [setup.i18n], {
    QORE_TYPESCRIPT_ACTION_SCRIPTS: "/tmp/unrelated-actions.js",
    QORE_DATA_PROVIDERS: "UnrelatedDataProvider",
    QORE_PROVIDER_INDEX_DIR: "/tmp/unrelated-provider-index",
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, summary + "\n");
  assert.deepEqual(readFileSync(join(setup.work, "args.txt"), "utf8").trim().split("\n"), [
    "--no-color", "--check-source-tree", "--require-standard-locales", "--require-complete-locales", "--output",
    setup.i18n,
  ]);
  const env = readFileSync(join(setup.work, "env.txt"), "utf8");
  assert.doesNotMatch(env, /^QORE_TYPESCRIPT_ACTION_SCRIPTS=/m);
  assert.doesNotMatch(env, /^QORE_DATA_PROVIDERS=/m);
  assert.doesNotMatch(env, /^QORE_PROVIDER_INDEX_DIR=/m);
  const qlib = fileURLToPath(new URL("../../qlib", import.meta.url));
  assert.match(env, new RegExp(`^QORE_MODULE_DIR=${qlib.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "m"));
  assert.deepEqual(readdirSync(setup.work).filter((name) => name.startsWith("i18n-check.")), [],
    "without a report file argument, the temporary report of a passing check is removed");
});

test("without a report file argument, a failed check keeps its temporary report and names it", () => {
  const lines = staleLines("/x/i18n/data-provider.QWJj/cs.json", 25);
  const setup = setUp({ lines, status: 2 });
  const result = run(setup, [setup.i18n]);

  assert.equal(result.status, 2);
  const reported = result.stdout.match(/^the complete report \(25 line\(s\)\) is (.+)$/m);
  assert.ok(reported, result.stdout);
  assert.ok(reported[1].startsWith(join(setup.work, "i18n-check.")), reported[1]);
  assert.equal(readFileSync(reported[1], "utf8"), lines.map((line) => line + "\n").join(""));
});

test("a missing catalog directory or an unwritable report file is refused before the check runs", () => {
  const setup = setUp({ summary: "verified", status: 0 });
  const missing = run(setup, [join(setup.work, "no-such-dir")]);
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /i18n catalog directory .*no-such-dir does not exist/);

  const unwritable = run(setup, [setup.i18n, join(setup.work, "no-such-dir", "report.txt")]);
  assert.equal(unwritable.status, 1);
  assert.match(unwritable.stderr, /cannot write the report file .*no-such-dir\/report\.txt/);
  assert.equal(existsSync(join(setup.work, "args.txt")), false, "the checker did not run");
});
