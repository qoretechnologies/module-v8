// Tests provider translation synchronization against regenerated roots.
//
// Copyright 2026 Qore Technologies, s.r.o.

import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  STANDARD_TRANSLATION_LOCALES,
  synchronizeTranslations,
} from "./sync-i18n-translations.mjs";

const temporaryDirectories = [];
const script = fileURLToPath(
  new URL("./sync-i18n-translations.mjs", import.meta.url),
);

function temporaryDirectory() {
  const directory = mkdtempSync(join(tmpdir(), "module-v8-i18n-sync-"));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function writeJson(file, value) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function messagesCatalog(locale, messages) {
  return {
    schema_version: 1,
    locales: {
      [locale]: { messages },
    },
  };
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

test("preserves current translations and removes stale and orphaned entries", () => {
  const work = temporaryDirectory();
  const existing = join(work, "existing");
  const generated = join(work, "generated");
  const domain = "data-provider.VGVzdA";
  const rootMessages = {
    current: { source: "Current source", message: "Current source" },
    changed: { source: "New source", message: "New source" },
    new: { source: "New entry", message: "New entry" },
  };

  writeJson(
    join(generated, domain, "root.json"),
    messagesCatalog("root", rootMessages),
  );
  writeJson(
    join(existing, domain, "cs.json"),
    messagesCatalog("cs", {
      current: { source: "Current source", message: "Aktuální překlad" },
      changed: { source: "Old source", message: "Starý překlad" },
      removed: { source: "Removed source", message: "Odstraněný překlad" },
      malformed: { source: "Current source", message: "" },
    }),
  );
  writeJson(
    join(existing, domain, "pt.json"),
    messagesCatalog("pt", {
      current: { source: "Current source", message: "Tradução atual" },
    }),
  );
  writeJson(
    join(existing, "data-provider.T3JwaGFuZWQ", "cs.json"),
    messagesCatalog("cs", {
      orphaned: { source: "Orphaned", message: "Sirotek" },
    }),
  );

  synchronizeTranslations(existing, generated);

  assert.deepEqual(
    readJson(join(generated, domain, "root.json")),
    messagesCatalog("root", rootMessages),
  );
  assert.deepEqual(
    readJson(join(generated, domain, "cs.json")),
    messagesCatalog("cs", {
      current: { source: "Current source", message: "Aktuální překlad" },
    }),
  );
  assert.deepEqual(
    readJson(join(generated, domain, "pt.json")),
    messagesCatalog("pt", {
      current: { source: "Current source", message: "Tradução atual" },
    }),
  );
  for (const locale of STANDARD_TRANSLATION_LOCALES) {
    assert.ok(
      readJson(join(generated, domain, `${locale}.json`)).locales[locale],
    );
  }
});

test("creates empty standard locale catalogs for a newly generated domain", () => {
  const work = temporaryDirectory();
  const existing = join(work, "existing");
  const generated = join(work, "generated");
  const domain = "data-provider.TmV3";
  mkdirSync(existing);
  writeJson(
    join(generated, domain, "root.json"),
    messagesCatalog("root", {
      greeting: { source: "Hello", message: "Hello" },
    }),
  );

  synchronizeTranslations(existing, generated);

  for (const locale of STANDARD_TRANSLATION_LOCALES) {
    assert.deepEqual(
      readJson(join(generated, domain, `${locale}.json`)),
      messagesCatalog(locale, {}),
    );
  }
});

test("rejects malformed generated roots and translation locale mismatches", () => {
  const malformedRootWork = temporaryDirectory();
  const malformedRootExisting = join(malformedRootWork, "existing");
  const malformedRootGenerated = join(malformedRootWork, "generated");
  mkdirSync(malformedRootExisting);
  writeJson(join(malformedRootGenerated, "data-provider.QmFk", "root.json"), {
    schema_version: 1,
    locales: { root: {} },
  });
  assert.throws(
    () =>
      synchronizeTranslations(malformedRootExisting, malformedRootGenerated),
    /must contain a messages object/,
  );

  const wrongLocaleWork = temporaryDirectory();
  const wrongLocaleExisting = join(wrongLocaleWork, "existing");
  const wrongLocaleGenerated = join(wrongLocaleWork, "generated");
  const domain = "data-provider.V3Jvbmc";
  writeJson(
    join(wrongLocaleGenerated, domain, "root.json"),
    messagesCatalog("root", {}),
  );
  writeJson(
    join(wrongLocaleExisting, domain, "cs.json"),
    messagesCatalog("de", {}),
  );
  assert.throws(
    () => synchronizeTranslations(wrongLocaleExisting, wrongLocaleGenerated),
    /must contain only locale "cs"/,
  );
});

test("rejects missing inputs, invalid JSON, and generated trees without domains", () => {
  const work = temporaryDirectory();
  const existing = join(work, "existing");
  const generated = join(work, "generated");
  assert.throws(
    () => synchronizeTranslations(existing, generated),
    /existing catalog directory/,
  );

  mkdirSync(existing);
  mkdirSync(generated);
  assert.throws(
    () => synchronizeTranslations(existing, generated),
    /contains no provider domains/,
  );

  const domain = "data-provider.SW52YWxpZA";
  writeJson(join(generated, domain, "root.json"), messagesCatalog("root", {}));
  mkdirSync(join(existing, domain), { recursive: true });
  writeFileSync(join(existing, domain, "cs.json"), "{not json}\n");
  assert.throws(
    () => synchronizeTranslations(existing, generated),
    /cannot read JSON catalog/,
  );
});

test("command-line interface reports usage and performs synchronization", () => {
  const usage = spawnSync(process.execPath, [script], { encoding: "utf8" });
  assert.equal(usage.status, 1);
  assert.match(usage.stderr, /usage:/);

  const work = temporaryDirectory();
  const existing = join(work, "existing");
  const generated = join(work, "generated");
  const domain = "data-provider.Q2xp";
  mkdirSync(existing);
  writeJson(join(generated, domain, "root.json"), messagesCatalog("root", {}));

  const result = spawnSync(process.execPath, [script, existing, generated], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(
    readJson(join(generated, domain, "cs.json")),
    messagesCatalog("cs", {}),
  );
});
