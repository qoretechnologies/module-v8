#!/usr/bin/env node
// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
//
// The upstream schema documents that CI qualifies. schema-inputs.json pins each of them with the SHA-256 of its bytes;
// the pins are the source of truth. CI reads the pinned documents from a private mirror (the generic package registry
// of the GitLab project) and never from the upstream services, which a scheduled job compares with the pins. The
// documents are private inputs, never package artifacts. See design/schema-cache.md.
//
//   schema-inputs.cjs mirror DIRECTORY          fetch every pinned document from the mirror (CI)
//   schema-inputs.cjs upstream DIRECTORY        fetch every pinned document from its upstream service
//   schema-inputs.cjs stage DIRECTORY           fetch them from upstream into the mirror's layout, for an upload
//   schema-inputs.cjs check-upstream DIRECTORY  compare upstream with the pins and run the update commands
//
// mirror and upstream write DIRECTORY/hubspot/NAME.swagger.json (for qore-hubspot-schemas import) and
// DIRECTORY/APP.json (for qore-app-schemas import APP). The mirror is QORE_SCHEMA_INPUT_MIRROR, read with CI_JOB_TOKEN
// in CI or with QORE_SCHEMA_INPUT_MIRROR_TOKEN elsewhere; a token is sent only to the mirror and is never printed.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { downloadDocument, DownloadStatusError } = require('../../ts/dist/schema-cache/download');
const hubspotStore = require('../../ts/dist/schema-cache/hubspot-store');
const { MAX_SCHEMA_BYTES, schemaNames } = require('../../ts/dist/schema-cache/hubspot');
const { assembleInput, downloadSource, sourceUrls } = require('../../ts/dist/schema-cache/app-store');
const { digest, MAX_BYTES } = require('../../ts/dist/schema-cache/apps');
const { EXIT_UNAVAILABLE, SchemaSourceUnavailableError } = require('../../ts/dist/schema-cache/schema-errors');
const pins = require('./schema-inputs.json');

const USAGE = 'Usage: schema-inputs.cjs mirror|upstream|stage|check-upstream ABSOLUTE_DIRECTORY';
const SHA256 = /^[a-f0-9]{64}$/;
const HUBSPOT_RELEASE = /^https:\/\/api\.hubspot\.com\/public\/api\/spec\/v2\/specs\/release\/\d+\/version\/3$/;
const DIST = path.resolve(__dirname, '../../ts/dist/schema-cache');
const REVIEW = 'review the change before updating the pin, as design/schema-cache.md describes';

/**
 * Returns every pinned document: its id, app, name, upstream URL, SHA-256, mirror file name and size bound. The pins
 * must name exactly the documents that the catalogue downloads, at the URLs it downloads them from.
 */
function pinnedSources(configuration = pins) {
  const fail = message => { throw new Error(`SCHEMA-INPUT-PINS: ${message}`); };
  const sources = [];
  const hubspot = configuration.hubspot?.sources ?? {};
  if (JSON.stringify(Object.keys(hubspot).sort()) !== JSON.stringify(schemaNames)) {
    fail(`hubspot needs exactly the documents ${schemaNames.join(', ')}`);
  }
  for (const name of schemaNames) {
    const { url, sha256 } = hubspot[name];
    if (typeof url !== 'string' || !HUBSPOT_RELEASE.test(url)) fail(`hubspot ${name} needs a v3 release URL`);
    sources.push({ id: `hubspot ${name}`, app: 'hubspot', name, url, sha256, file: `hubspot-${name}.json`,
      limit: MAX_SCHEMA_BYTES });
  }
  for (const [app, pin] of Object.entries(configuration.apps ?? {})) {
    let urls;
    try { urls = sourceUrls(app); } catch (error) { fail(`${app}: ${error.message}`); }
    if (typeof pin.sha256 !== 'string' || !SHA256.test(pin.sha256)) fail(`${app} needs the SHA-256 of its input`);
    if (JSON.stringify(Object.keys(pin.sources ?? {}).sort()) !== JSON.stringify(Object.keys(urls).sort())) {
      fail(`${app} needs exactly the sources ${Object.keys(urls).join(', ')}`);
    }
    for (const [name, url] of Object.entries(urls)) {
      if (pin.sources[name].url !== url) fail(`${app} ${name} is pinned at ${pin.sources[name].url}, but the catalogue `
        + `downloads ${url}`);
      sources.push({ id: `${app} ${name}`, app, name, url, sha256: pin.sources[name].sha256, file: `${app}-${name}.json`,
        limit: MAX_BYTES });
    }
  }
  for (const source of sources) {
    if (typeof source.sha256 !== 'string' || !SHA256.test(source.sha256)) fail(`${source.id} needs a SHA-256`);
  }
  return sources;
}

/** Returns the mirror's URL of a pinned document and the header with the token that reads it. */
function mirrorRequest(source, env = process.env) {
  const base = env.QORE_SCHEMA_INPUT_MIRROR;
  if (!base) throw new Error('SCHEMA-INPUT-MIRROR: QORE_SCHEMA_INPUT_MIRROR (the base URL of the mirror) is not set');
  const headers = env.CI_JOB_TOKEN ? { 'JOB-TOKEN': env.CI_JOB_TOKEN }
    : env.QORE_SCHEMA_INPUT_MIRROR_TOKEN ? { 'PRIVATE-TOKEN': env.QORE_SCHEMA_INPUT_MIRROR_TOKEN } : undefined;
  if (!headers) throw new Error('SCHEMA-INPUT-MIRROR: neither CI_JOB_TOKEN nor QORE_SCHEMA_INPUT_MIRROR_TOKEN is set');
  return { url: `${base.replace(/\/+$/, '')}/${source.sha256}/${source.file}`, headers };
}

/** Fetches a pinned document from the mirror; a document missing from the mirror is reported as such. */
async function fromMirror(source, env = process.env, download = downloadDocument) {
  const { url, headers } = mirrorRequest(source, env);
  try {
    return await download(url, { prefix: 'SCHEMA-INPUT-MIRROR', limit: source.limit,
      userAgent: 'qore-schema-inputs/1', headers });
  } catch (error) {
    if (error instanceof DownloadStatusError && error.status === 404) {
      throw new Error(`SCHEMA-INPUT-MIRROR: the mirror has no ${source.id} document with the pinned SHA-256 `
        + `${source.sha256} (${url}); stage and upload the reviewed document, as design/schema-cache.md describes`);
    }
    throw error;
  }
}

/** Fetches a pinned document from its upstream service with the catalogue's own download code. */
function fromUpstream(source) {
  return source.app === 'hubspot' ? hubspotStore.download(source.url) : downloadSource(source.app, source.name);
}

/** The message for an upstream document that no longer has its pinned SHA-256 or URL. */
function upstreamChanged(source, actual, url = source.url) {
  return url === source.url
    ? `upstream changed: ${source.id}, ${source.sha256} → ${actual} (${url}); ${REVIEW}`
    : `upstream changed: ${source.id}, ${source.url} → ${url} (${source.sha256} → ${actual}); ${REVIEW}`;
}

/** Returns the bytes of a document if they have its pinned SHA-256. */
function verified(source, bytes, origin) {
  const actual = digest(bytes);
  if (actual === source.sha256) return bytes;
  throw new Error(origin === 'upstream' ? upstreamChanged(source, actual)
    : `SCHEMA-INPUT-MIRROR: the mirror's ${source.id} document has the SHA-256 ${actual}, not the pinned `
      + source.sha256);
}

/**
 * Fetches and verifies every pinned document, one at a time, and assembles each app's input, which must have its
 * pinned SHA-256 too. Returns the documents and the app inputs; nothing is written.
 */
async function collect(origin, configuration, fetchSource) {
  const sources = pinnedSources(configuration);
  const documents = new Map();
  for (const source of sources) documents.set(source, verified(source, await fetchSource(source), origin));
  const inputs = {};
  for (const [app, pin] of Object.entries(configuration.apps ?? {})) {
    const parts = Object.fromEntries(sources.filter(source => source.app === app)
      .map(source => [source.name, documents.get(source)]));
    const bytes = assembleInput(app, parts);
    const actual = digest(bytes);
    if (actual !== pin.sha256) {
      throw new Error(`SCHEMA-INPUT-PINS: the pinned ${app} sources combine to an input with the SHA-256 ${actual}, `
        + `not the pinned ${pin.sha256}`);
    }
    inputs[app] = bytes;
  }
  return { sources, documents, inputs };
}

function writePrivate(file, bytes) {
  fs.writeFileSync(file, bytes, { flag: 'wx', mode: 0o600 });
}

function requireDirectory(directory) {
  if (typeof directory !== 'string' || !path.isAbsolute(directory)) throw new Error(USAGE);
}

/** Fetches every pinned document from the mirror or from upstream and writes the import inputs to the directory. */
async function fetchInputs(directory, origin, { configuration = pins, fetchSource } = {}) {
  requireDirectory(directory);
  if (origin !== 'mirror' && origin !== 'upstream') throw new Error(USAGE);
  const fetch = fetchSource ?? (origin === 'mirror' ? source => fromMirror(source) : fromUpstream);
  const { sources, documents, inputs } = await collect(origin, configuration, fetch);
  fs.mkdirSync(path.join(directory, 'hubspot'), { recursive: true, mode: 0o700 });
  for (const source of sources.filter(source => source.app === 'hubspot')) {
    writePrivate(path.join(directory, 'hubspot', `${source.name}.swagger.json`), documents.get(source));
  }
  for (const [app, bytes] of Object.entries(inputs)) writePrivate(path.join(directory, `${app}.json`), bytes);
}

/**
 * Fetches every pinned document from upstream and writes it to DIRECTORY/SHA256/FILE, the mirror's layout. Returns one
 * "SHA256<tab>FILE" line per document.
 */
async function stage(directory, { configuration = pins, fetchSource = fromUpstream } = {}) {
  requireDirectory(directory);
  const { sources, documents } = await collect('upstream', configuration, fetchSource);
  return sources.map(source => {
    fs.mkdirSync(path.join(directory, source.sha256), { recursive: true, mode: 0o700 });
    writePrivate(path.join(directory, source.sha256, source.file), documents.get(source));
    return `${source.sha256}\t${source.file}`;
  });
}

/** The user-facing update commands for every pinned document, each with a cache of its own in the directory. */
function updateCommands(directory, configuration = pins) {
  const apps = Object.keys(configuration.apps ?? {});
  return [
    { label: 'qore-hubspot-schemas update',
      args: [path.join(DIST, 'hubspot-cli.js'), '--cache-dir', path.join(directory, 'hubspot'), 'update'] },
    { label: `qore-app-schemas update ${apps.join(' ')}`,
      args: [path.join(DIST, 'app-cli.js'), '--cache-dir', path.join(directory, 'apps'), 'update', ...apps] },
  ];
}

/** Runs an update command with this Node.js, showing its output; returns its exit status. */
function runUpdateCommand(command) {
  const result = spawnSync(process.execPath, command.args, { stdio: 'inherit' });
  return result.status ?? 1;
}

const UPDATE_STATUS = { 2: 'a schema was refused', 69: 'a source was unavailable', 75: 'a schema was not verified' };

/**
 * Compares the upstream documents with the pins, and runs the user-facing update commands against the upstream
 * services. Returns 0 if every document is unchanged and every update succeeded, 69 if the only failures were
 * unavailable sources, and 1 otherwise.
 */
async function checkUpstream(directory, { configuration = pins, hubspotInputs = hubspotStore.downloadInputs,
  fetchSource = fromUpstream, runUpdate = runUpdateCommand, log = console.log } = {}) {
  requireDirectory(directory);
  const sources = pinnedSources(configuration);
  const count = { unchanged: 0, changed: 0, unavailable: 0, failed: 0 };
  const failure = (id, error) => {
    const unavailable = error instanceof SchemaSourceUnavailableError;
    ++count[unavailable ? 'unavailable' : 'failed'];
    log(`${unavailable ? 'upstream unavailable' : 'check failed'}: ${id}: ${error.message}`);
  };
  // the HubSpot documents that the live catalogue selects, as qore-hubspot-schemas update downloads them
  let hubspot;
  try {
    hubspot = await hubspotInputs();
  } catch (error) {
    failure('hubspot', error);
  }
  for (const source of sources) {
    let bytes;
    let url = source.url;
    if (source.app === 'hubspot') {
      if (!hubspot) continue;
      ({ bytes, source: url } = hubspot[source.name]);
    } else {
      try {
        bytes = await fetchSource(source);
      } catch (error) {
        failure(source.id, error);
        continue;
      }
    }
    const actual = digest(bytes);
    if (actual === source.sha256 && url === source.url) {
      ++count.unchanged;
      log(`unchanged: ${source.id} ${actual}`);
    } else {
      ++count.changed;
      log(upstreamChanged(source, actual, url));
    }
  }
  for (const command of updateCommands(directory, configuration)) {
    const status = runUpdate(command);
    if (status === 0) {
      log(`updated: ${command.label}`);
    } else {
      ++count[status === EXIT_UNAVAILABLE ? 'unavailable' : 'failed'];
      log(`update failed: ${command.label} exited with ${status}${UPDATE_STATUS[status] ? ` (${UPDATE_STATUS[status]})`
        : ''}`);
    }
  }
  log(`upstream check: ${count.unchanged} unchanged, ${count.changed} changed, ${count.unavailable} unavailable, `
    + `${count.failed} failed`);
  if (count.changed || count.failed) return 1;
  return count.unavailable ? EXIT_UNAVAILABLE : 0;
}

/** Runs a command; see the header of this file. Returns the exit status. */
async function main(args, output = console.log) {
  const [command, directory] = args;
  if (args.length !== 2 || !['mirror', 'upstream', 'stage', 'check-upstream'].includes(command)) {
    throw new Error(USAGE);
  }
  requireDirectory(directory);
  if (command === 'check-upstream') return checkUpstream(fs.realpathSync(directory));
  if (command === 'stage') {
    for (const line of await stage(directory)) output(line);
  } else {
    await fetchInputs(directory, command);
  }
  return 0;
}

module.exports = { checkUpstream, fetchInputs, fromMirror, main, mirrorRequest, pinnedSources, stage, updateCommands };
if (require.main === module) {
  main(process.argv.slice(2)).then(status => { process.exitCode = status; }, error => {
    console.error(error.message);
    process.exitCode = error instanceof SchemaSourceUnavailableError ? EXIT_UNAVAILABLE : 1;
  });
}
