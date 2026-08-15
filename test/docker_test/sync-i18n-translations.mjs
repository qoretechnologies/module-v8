// Synchronizes provider translations with freshly generated root catalogs.
//
// Copyright 2026 Qore Technologies, s.r.o.

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const STANDARD_TRANSLATION_LOCALES = Object.freeze([
  "cs",
  "de",
  "es",
  "fr",
  "it",
  "ja",
  "ko",
  "pl",
  "sk",
  "uk",
  "zh-Hant",
  "zh-TW",
]);

const DOMAIN_PREFIX = "data-provider.";
let temporaryFileSequence = 0;

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`cannot read JSON catalog ${file}: ${error.message}`, {
      cause: error,
    });
  }
}

function messagesForLocale(catalog, locale, file) {
  if (
    !isRecord(catalog) ||
    catalog.schema_version !== 1 ||
    !isRecord(catalog.locales)
  ) {
    throw new Error(
      `catalog ${file} must have schema_version 1 and a locales object`,
    );
  }

  const locales = Object.keys(catalog.locales);
  if (locales.length !== 1 || locales[0] !== locale) {
    throw new Error(
      `catalog ${file} must contain only locale ${JSON.stringify(locale)}`,
    );
  }

  const localeCatalog = catalog.locales[locale];
  if (!isRecord(localeCatalog) || !isRecord(localeCatalog.messages)) {
    throw new Error(
      `catalog ${file} locale ${JSON.stringify(locale)} must contain a messages object`,
    );
  }
  return localeCatalog.messages;
}

function writeJsonAtomically(file, value) {
  const temporaryFile = `${file}.tmp-${process.pid}-${temporaryFileSequence++}`;
  try {
    writeFileSync(temporaryFile, `${JSON.stringify(value, null, 2)}\n`, {
      mode: 0o644,
    });
    renameSync(temporaryFile, file);
  } finally {
    if (existsSync(temporaryFile)) {
      unlinkSync(temporaryFile);
    }
  }
}

function synchronizedMessages(messages, rootMessages) {
  return Object.fromEntries(
    Object.entries(messages).filter(([id, entry]) => {
      const rootEntry = rootMessages[id];
      return (
        isRecord(entry) &&
        typeof entry.source === "string" &&
        typeof entry.message === "string" &&
        entry.message.length > 0 &&
        isRecord(rootEntry) &&
        typeof rootEntry.source === "string" &&
        entry.source === rootEntry.source
      );
    }),
  );
}

function translationLocales(existingDomainDirectory) {
  const locales = new Set(STANDARD_TRANSLATION_LOCALES);
  if (!existsSync(existingDomainDirectory)) {
    return [...locales].sort();
  }

  for (const entry of readdirSync(existingDomainDirectory, {
    withFileTypes: true,
  })) {
    if (
      entry.isFile() &&
      entry.name.endsWith(".json") &&
      entry.name !== "root.json"
    ) {
      locales.add(entry.name.slice(0, -".json".length));
    }
  }
  return [...locales].sort();
}

function synchronizeDomain(existingDirectory, generatedDirectory, domain) {
  const generatedDomainDirectory = join(generatedDirectory, domain);
  const rootFile = join(generatedDomainDirectory, "root.json");
  const rootMessages = messagesForLocale(readJson(rootFile), "root", rootFile);
  const existingDomainDirectory = join(existingDirectory, domain);

  for (const locale of translationLocales(existingDomainDirectory)) {
    const existingFile = join(existingDomainDirectory, `${locale}.json`);
    let messages = {};
    if (existsSync(existingFile)) {
      messages = synchronizedMessages(
        messagesForLocale(readJson(existingFile), locale, existingFile),
        rootMessages,
      );
    }

    writeJsonAtomically(join(generatedDomainDirectory, `${locale}.json`), {
      schema_version: 1,
      locales: {
        [locale]: { messages },
      },
    });
  }
}

export function synchronizeTranslations(existingDirectory, generatedDirectory) {
  if (!existsSync(existingDirectory)) {
    throw new Error(
      `existing catalog directory ${existingDirectory} does not exist`,
    );
  }
  if (!existsSync(generatedDirectory)) {
    throw new Error(
      `generated catalog directory ${generatedDirectory} does not exist`,
    );
  }

  const domains = readdirSync(generatedDirectory, { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && entry.name.startsWith(DOMAIN_PREFIX),
    )
    .map((entry) => entry.name)
    .sort();
  if (domains.length === 0) {
    throw new Error(
      `generated catalog directory ${generatedDirectory} contains no provider domains`,
    );
  }

  for (const domain of domains) {
    mkdirSync(join(generatedDirectory, domain), { recursive: true });
    synchronizeDomain(existingDirectory, generatedDirectory, domain);
  }
}

const isMain =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMain) {
  if (process.argv.length !== 4) {
    console.error(
      `usage: ${basename(process.argv[1])} EXISTING_DIR GENERATED_DIR`,
    );
    process.exitCode = 1;
  } else {
    try {
      synchronizeTranslations(
        resolve(process.argv[2]),
        resolve(process.argv[3]),
      );
    } catch (error) {
      console.error(`ERROR: ${error.message}`);
      process.exitCode = 1;
    }
  }
}
