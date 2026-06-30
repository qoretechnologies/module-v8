// Copyright 2026 Qore Technologies, s.r.o.
//
// Build-time swagger pruning. For each schema-based app, shrink its swagger in
// dist/schemas to only the operations the app actually exposes (its actions'
// swagger_path) plus the transitive $ref closure of those operations, and drop
// unused webhook blobs (x-webhooks / webhooks). Runs after `copy-schemas`, in
// place on dist/schemas; src/schemas is left intact.
//
// Rationale (design/lazy-action-loading.md): parsing the full schemas dominates
// app-load time and memory (e.g. github 37.5 MB / ~341 ms / ~127 MB heap) while
// only a small allowedPaths subset is ever used.
//
// Usage: node scripts/prune-schemas.js [appDir ...]   (default: every app under dist/apps)

const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '..', 'dist');
const APPS_DIR = path.join(DIST, 'apps');

// collect every local "#/..." $ref string reachable from a node
function collectRefs(node, acc) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const v of node) collectRefs(v, acc);
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (k === '$ref' && typeof v === 'string' && v.startsWith('#/')) acc.add(v);
    else collectRefs(v, acc);
  }
}

// resolve a "#/a/b/c" pointer against the root schema
function resolveRef(root, ref) {
  return ref
    .slice(2)
    .split('/')
    .map((s) => s.replace(/~1/g, '/').replace(/~0/g, '~'))
    .reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), root);
}

function pruneApp(appDir) {
  let mod;
  try {
    mod = require(path.join(APPS_DIR, appDir));
  } catch {
    return null; // not a loadable app dir
  }
  const getApp = mod && (mod.default || mod);
  if (typeof getApp !== 'function') return null;

  let app;
  try {
    app = getApp('en');
  } catch (e) {
    return { app: appDir, error: 'getApp failed: ' + e.message };
  }
  if (!app || !app.swagger) return null; // not a schema-based app

  const schemaFile = path.join(DIST, app.swagger);
  if (!fs.existsSync(schemaFile)) return { app: app.name, error: 'schema missing: ' + app.swagger };

  const before = fs.statSync(schemaFile).size;
  const schema = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));

  // kept path -> Set(method) from the app's actions
  const keep = new Map();
  for (const a of app.actions || []) {
    if (!a.swagger_path) continue;
    const i = a.swagger_path.lastIndexOf('/');
    const p = a.swagger_path.slice(0, i);
    const m = a.swagger_path.slice(i + 1).toLowerCase();
    if (!keep.has(p)) keep.set(p, new Set());
    keep.get(p).add(m);
  }

  // pruned paths: kept methods (+ path-level parameters) for each kept path
  const prunedPaths = {};
  for (const [p, methods] of keep) {
    const item = schema.paths && schema.paths[p];
    if (!item) continue;
    const out = {};
    if (item.parameters) out.parameters = item.parameters;
    for (const m of methods) if (item[m] !== undefined) out[m] = item[m];
    prunedPaths[p] = out;
  }

  // Standard metadata kept wholesale; everything else is a ref container that we
  // prune to the reachable set. securityDefinitions / components.securitySchemes are
  // referenced by name (not $ref), so they are kept wholesale.
  const METADATA = new Set([
    'swagger', 'openapi', 'info', 'host', 'basePath', 'schemes', 'consumes', 'produces',
    'security', 'tags', 'externalDocs', 'servers', 'securityDefinitions',
  ]);

  // transitive $ref closure, seeded from the kept operations + kept metadata (NOT the
  // ref containers, so unreferenced definitions/components/x-* members fall away).
  const wanted = new Set();
  collectRefs(prunedPaths, wanted);
  for (const [k, v] of Object.entries(schema)) {
    if (k === 'paths' || METADATA.has(k)) collectRefs(v, wanted);
  }
  let frontier = [...wanted];
  while (frontier.length) {
    const next = [];
    for (const ref of frontier) {
      const sub = new Set();
      collectRefs(resolveRef(schema, ref), sub);
      for (const r of sub) if (!wanted.has(r)) {
        wanted.add(r);
        next.push(r);
      }
    }
    frontier = next;
  }

  // keep only reachable members of a "#/<...>/<name>" container
  const pruneContainer = (members, prefix) => {
    const kept = {};
    for (const name of Object.keys(members || {})) if (wanted.has(prefix + name)) kept[name] = members[name];
    return kept;
  };

  // rebuild
  const pruned = {};
  pruned.paths = prunedPaths;
  for (const [k, v] of Object.entries(schema)) {
    if (k === 'paths') continue;
    if (METADATA.has(k)) {
      pruned[k] = v; // metadata kept as-is
    } else if (k === 'definitions') {
      pruned.definitions = pruneContainer(v, '#/definitions/');
    } else if (k === 'components') {
      const keptComp = {};
      for (const [ctype, members] of Object.entries(v || {})) {
        if (ctype === 'securitySchemes') { keptComp[ctype] = members; continue; }
        const kk = pruneContainer(members, `#/components/${ctype}/`);
        if (Object.keys(kk).length) keptComp[ctype] = kk;
      }
      pruned.components = keptComp;
    } else {
      // any other container (definitions-like vendor blob, e.g. x-components, x-webhooks):
      // keep only reachable members; drop entirely if nothing is referenced
      const kk = pruneContainer(v, `#/${k}/`);
      if (Object.keys(kk).length) pruned[k] = kk;
    }
  }

  // self-validation: the pruned schema must have no dangling local $refs
  const finalRefs = new Set();
  collectRefs(pruned, finalRefs);
  const dangling = [...finalRefs].filter((r) => resolveRef(pruned, r) === undefined);
  if (dangling.length) {
    throw new Error(`${app.name}: pruning produced ${dangling.length} dangling refs, e.g. ${dangling.slice(0, 3).join(', ')}`);
  }

  fs.writeFileSync(schemaFile, JSON.stringify(pruned));
  const after = fs.statSync(schemaFile).size;
  return {
    app: app.name,
    file: app.swagger,
    paths: `${Object.keys(prunedPaths).length}/${Object.keys(schema.paths || {}).length}`,
    refs: wanted.size,
    before,
    after,
  };
}

function main() {
  const args = process.argv.slice(2);
  const dirs = args.length ? args : fs.readdirSync(APPS_DIR).filter((d) => fs.statSync(path.join(APPS_DIR, d)).isDirectory());
  const mb = (b) => (b / 1024 / 1024).toFixed(2);
  let totalBefore = 0, totalAfter = 0, n = 0;
  console.log('app                    paths     refs   before(MB)  after(MB)   saved');
  console.log('-'.repeat(74));
  for (const d of dirs) {
    const r = pruneApp(d);
    if (!r) continue;
    if (r.error) {
      console.error(`! ${r.app}: ${r.error}`);
      continue;
    }
    totalBefore += r.before;
    totalAfter += r.after;
    n++;
    console.log(
      `${r.app.padEnd(22)} ${String(r.paths).padStart(7)} ${String(r.refs).padStart(6)} ` +
      `${mb(r.before).padStart(10)} ${mb(r.after).padStart(10)} ${(100 * (1 - r.after / r.before)).toFixed(0).padStart(5)}%`
    );
  }
  console.log('-'.repeat(74));
  console.log(`${n} schema app(s): ${mb(totalBefore)} MB -> ${mb(totalAfter)} MB (saved ${mb(totalBefore - totalAfter)} MB)`);
}

main();
