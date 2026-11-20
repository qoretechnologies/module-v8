// Copyright (C) 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
//
// The bootstrap of a restricted JavaScript program (qoretechnologies/qore#6845)
//
// A restricted program runs trusted code (the TypeScript apps of this module) for callers that a Qore sandbox
// governs: no code of the caller runs in it, only data of the caller reaches it, and the program must not give that
// data access to the process.  Node.js has no permission model per isolate, so the program is built so that its code
// cannot reach what the sandbox does not control:
// - code is loaded by the loader below, not by Node's module loader: a module object has no constructor and no link
//   to Module._load, and require() resolves only the files of the module's own roots and an allowlist of builtins
// - the builtins that reach files, processes, the network or the runtime itself are refused; the ones that the
//   module's own code needs while it loads (the catalogue's schema cache) are given through a membrane during the
//   load phase only: every function, object and prototype reached through it checks the seal, so a reference that
//   the code kept stops working once the program is sealed
// - globals that reach the runtime (process, require, fetch, WebSocket, ...) are removed or replaced before any
//   code is loaded, so that new Function() code, which runs in the global scope, finds nothing more than a module
// - dynamic import() is refused by the host callback that the C++ side installs
// - the network is reached only through the host bridge (fetch and the http/https modules), which the C++ side gives
//   as _qoreBoot.bridge: the host makes the request under the caller's sandbox
//
// This file is the body of the LoadEnvironment() main script of a restricted program: it runs with Node's internal
// require(), and _qoreBoot holds the data that the C++ side gave (see QoreV8Program::init())

'use strict';

// dynamic import() is refused from here on: Node has installed its own callback while it prepared the main script
_qoreBoot.lockImports();

const _qoreR = (() => {
    // the real process object, which the minimal process replaces as the global once the load starts
    const realProcess = process;
    const Module = require('module');
    const vm = require('vm');
    const fs = require('fs');
    const path = require('path');

    const boot = _qoreBoot;
    // the directories whose files the program may load (the module's distribution and its node_modules)
    const roots = boot.roots.map((r) => fs.realpathSync(r));
    // the source of the main module
    const mainSource = boot.source;
    const mainFilename = boot.filename;
    // the host bridge for network requests: function(hash) -> hash
    const bridge = boot.bridge;

    let sealed = false;

    // a refusal: the error code tells the host that the app needs a builtin that tenants do not get
    const denied = (what) => {
        const err = new Error(`QORE_TENANT_DENIED_BUILTIN: ${what} is not available in a restricted program`);
        err.code = 'QORE_TENANT_DENIED_BUILTIN';
        err.builtin = what;
        return err;
    };

    // the builtins that every restricted program gets: they reach no file, process or network
    const allowed = new Set(['assert', 'assert/strict', 'buffer', 'events', 'stream', 'stream/promises',
        'stream/web', 'string_decoder', 'url', 'util', 'util/types', 'querystring', 'punycode', 'zlib', 'crypto',
        'path', 'path/posix', 'timers', 'timers/promises', 'perf_hooks', 'async_hooks', 'diagnostics_channel']);
    // the builtins that the module's own code may use while it loads, through the membrane, until the seal
    const loadPhase = new Set(['fs', 'fs/promises', 'child_process', 'net', 'tls', 'dns', 'dns/promises']);
    // the builtins that the shims replace, from the start: the code keeps the modules that it loads, so a module
    // that it uses after the seal must be the shim already; the host bridge decides what a request may reach
    const shims = new Map();

    // the membrane: wraps a value of a load-phase builtin so that every use checks the seal
    const membraneCache = new WeakMap();
    const wrap = (value, name) => {
        if (value === null || (typeof value !== 'object' && typeof value !== 'function')) {
            return value;
        }
        let w = membraneCache.get(value);
        if (w) {
            return w;
        }
        const check = () => {
            if (sealed) {
                throw denied(name);
            }
        };
        w = new Proxy(value, {
            get(t, p, r) {
                check();
                const v = Reflect.get(t, p, t);
                const d = Reflect.getOwnPropertyDescriptor(t, p);
                if (d && !d.configurable && !d.writable && 'value' in d) {
                    // the invariant of a proxy: such a property is reported as the target has it, unwrapped; only a
                    // primitive or an object of data (all of whose own values are primitives, such as fs.constants;
                    // each program has its own instance of the builtins) is given, as anything else would escape
                    // the membrane
                    if (v !== null && (typeof v === 'object' || typeof v === 'function')) {
                        const data = typeof v === 'object' && Reflect.ownKeys(v).every((k) => {
                            const x = Reflect.getOwnPropertyDescriptor(v, k);
                            return x && 'value' in x && (x.value === null || (typeof x.value !== 'object'
                                && typeof x.value !== 'function'));
                        });
                        if (!data) {
                            throw denied(name);
                        }
                    }
                    return v;
                }
                return wrap(v, name);
            },
            set(t, p, v) { check(); return Reflect.set(t, p, v); },
            has(t, p) { check(); return Reflect.has(t, p); },
            ownKeys(t) { check(); return Reflect.ownKeys(t); },
            getOwnPropertyDescriptor(t, p) {
                check();
                const d = Reflect.getOwnPropertyDescriptor(t, p);
                if (d && !d.configurable) {
                    // a proxy must report a non-configurable property as the target has it
                    return d;
                }
                if (d) {
                    if ('value' in d) d.value = wrap(d.value, name);
                    if (d.get) d.get = wrap(d.get, name);
                    if (d.set) d.set = wrap(d.set, name);
                }
                return d;
            },
            getPrototypeOf(t) { check(); return wrap(Reflect.getPrototypeOf(t), name); },
            setPrototypeOf() { return false; },
            defineProperty() { return false; },
            deleteProperty() { return false; },
            apply(t, thisArg, args) { check(); return wrap(Reflect.apply(t, thisArg, args), name); },
            construct(t, args, nt) { check(); return wrap(Reflect.construct(t, args), name); },
        });
        membraneCache.set(value, w);
        return w;
    };

    // the modules that the loader has loaded, by file name
    const cache = new Map();

    const insideRoots = (file) => {
        let real;
        try {
            real = fs.realpathSync(file);
        } catch (e) {
            return null;
        }
        for (const r of roots) {
            if (real === r || real.startsWith(r + path.sep)) {
                return real;
            }
        }
        return null;
    };

    const isFile = (f) => { try { return fs.statSync(f).isFile(); } catch (e) { return false; } };
    const isDir = (f) => { try { return fs.statSync(f).isDirectory(); } catch (e) { return false; } };

    const tryFile = (f) => {
        for (const c of [f, f + '.js', f + '.cjs', f + '.json']) {
            if (isFile(c)) {
                return c;
            }
        }
        if (isDir(f)) {
            const pkgFile = path.join(f, 'package.json');
            if (isFile(pkgFile)) {
                let pkg;
                try { pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8')); } catch (e) { pkg = {}; }
                let entry = pkg.main;
                const ex = pkg.exports;
                if (typeof ex === 'string') {
                    entry = ex;
                } else if (ex && typeof ex === 'object') {
                    const dot = ex['.'] !== undefined ? ex['.'] : ex;
                    const pick = (v) => {
                        if (typeof v === 'string') return v;
                        if (v && typeof v === 'object') {
                            for (const k of ['require', 'node', 'default']) {
                                if (v[k] !== undefined) {
                                    const r = pick(v[k]);
                                    if (r) return r;
                                }
                            }
                        }
                        return undefined;
                    };
                    entry = pick(dot) || entry;
                }
                if (entry) {
                    const r = tryFile(path.resolve(f, entry));
                    if (r) return r;
                }
            }
            for (const c of ['index.js', 'index.cjs', 'index.json']) {
                const i = path.join(f, c);
                if (isFile(i)) return i;
            }
        }
        return null;
    };

    const resolveFile = (id, dir) => {
        let found = null;
        if (id.startsWith('./') || id.startsWith('../') || id.startsWith('/') || id === '.' || id === '..') {
            found = tryFile(path.resolve(dir, id));
        } else {
            // node_modules, walking up from the requiring directory, but only within the roots
            let d = dir;
            for (;;) {
                if (path.basename(d) !== 'node_modules') {
                    const c = tryFile(path.join(d, 'node_modules', id));
                    if (c) { found = c; break; }
                }
                const up = path.dirname(d);
                if (up === d) break;
                d = up;
            }
            // a root that is a node_modules directory serves bare names, as NODE_PATH does
            if (!found) {
                for (const r of roots) {
                    if (path.basename(r) === 'node_modules') {
                        const c = tryFile(path.join(r, id));
                        if (c) { found = c; break; }
                    }
                }
            }
        }
        if (!found) {
            const err = new Error(`Cannot find module '${id}'`);
            err.code = 'MODULE_NOT_FOUND';
            throw err;
        }
        const real = insideRoots(found);
        if (!real) {
            throw denied(`loading a file outside of the module's roots (${id})`);
        }
        return real;
    };

    const builtinName = (id) => id.startsWith('node:') ? id.slice(5) : id;

    const requireBuiltin = (name) => {
        if (shims.has(name)) {
            return shims.get(name);
        }
        if (allowed.has(name)) {
            return require(name);
        }
        if (!sealed && loadPhase.has(name)) {
            return wrap(require(name), name);
        }
        throw denied(name);
    };

    const isBuiltin = (name) => Module.isBuiltin(name);

    const makeRequire = (dir) => {
        const req = function require(id) {
            if (typeof id !== 'string') {
                throw new TypeError('require() expects a string');
            }
            const name = builtinName(id);
            if (id.startsWith('node:') || isBuiltin(name)) {
                return requireBuiltin(name);
            }
            return loadFile(resolveFile(id, dir));
        };
        req.resolve = (id) => {
            const name = builtinName(id);
            if (id.startsWith('node:') || isBuiltin(name)) return id;
            return resolveFile(id, dir);
        };
        req.cache = Object.freeze(Object.create(null));
        return Object.freeze(req);
    };

    const loadFile = (file) => {
        const cached = cache.get(file);
        if (cached) {
            return cached.exports;
        }
        if (sealed) {
            throw denied(`loading a file once the program is sealed (${path.basename(file)})`);
        }
        // a plain module object: no constructor, no link to Node's loader
        const mod = Object.create(null);
        mod.exports = {};
        mod.id = file;
        mod.filename = file;
        mod.loaded = false;
        mod.children = [];
        mod.paths = [];
        cache.set(file, mod);
        try {
            const src = fs.readFileSync(file, 'utf8');
            if (file.endsWith('.json')) {
                mod.exports = JSON.parse(src);
            } else {
                runModule(mod, src, file);
            }
        } catch (e) {
            cache.delete(file);
            throw e;
        }
        mod.loaded = true;
        return mod.exports;
    };

    const runModule = (mod, src, file) => {
        mod.require = makeRequire(path.dirname(file));
        const fn = vm.compileFunction(src, ['exports', 'require', 'module', '__filename', '__dirname'], {
            filename: file,
            // no host callback: a dynamic import() in the module is refused
        });
        fn.call(mod.exports, mod.exports, mod.require, mod, file, path.dirname(file));
    };

    // ---- globals: removed or replaced before any code of the program runs ----
    const minimalProcess = Object.freeze({
        env: Object.freeze(Object.create(null)),
        argv: Object.freeze([]),
        version: realProcess.version,
        versions: Object.freeze({...realProcess.versions}),
        platform: realProcess.platform,
        arch: realProcess.arch,
        release: Object.freeze({name: 'node'}),
        nextTick: (...a) => realProcess.nextTick(...a),
        hrtime: Object.assign((t) => realProcess.hrtime(t), {bigint: () => realProcess.hrtime.bigint()}),
        uptime: () => realProcess.uptime(),
        emitWarning: () => {},
        cwd: () => '/',
        on: () => minimalProcess,
        once: () => minimalProcess,
        off: () => minimalProcess,
        removeListener: () => minimalProcess,
        listenerCount: () => 0,
        exit: () => { throw denied('process.exit'); },
        stdout: Object.freeze({write: () => true, isTTY: false}),
        stderr: Object.freeze({write: () => true, isTTY: false}),
    });

    const removeGlobals = ['require', 'module', 'exports', 'WebSocket', 'EventSource', 'Worker',
        'BroadcastChannel', 'qore'];
    // the console writes to the process's stdout and stderr: a restricted program's output is dropped
    const noop = () => {};
    globalThis.console = Object.freeze(Object.fromEntries(['log', 'info', 'warn', 'error', 'debug', 'trace', 'dir',
        'table', 'time', 'timeEnd', 'timeLog', 'group', 'groupEnd', 'groupCollapsed', 'count', 'countReset',
        'assert'].map((k) => [k, noop])));
    for (const g of removeGlobals) {
        try { delete globalThis[g]; } catch (e) {}
    }
    // the network globals are replaced by the bridge's shims below
    for (const g of ['fetch', 'Request', 'Response', 'Headers', 'FormData']) {
        try { delete globalThis[g]; } catch (e) {}
    }

    // ---- the network: every request goes through the host bridge ----
    const { Buffer } = require('buffer');
    const EventEmitter = require('events');
    const stream = require('stream');
    const { URL } = require('url');

    // the host's request: {method, url, headers, body_b64, timeout_ms} -> {status, status_text, headers, body_b64,
    // url}, as JSON both ways, so that only plain data crosses into the host; the host raises an exception when the
    // request is refused or fails, which is given to the program as an Error whose code is the Qore error code
    const hostRequest = (req) => {
        if (typeof bridge !== 'function') {
            throw denied('the network');
        }
        let out;
        try {
            out = bridge(JSON.stringify(req));
        } catch (e) {
            if (e instanceof Error) {
                throw e;
            }
            const msg = String(e);
            const err = new Error(msg);
            const m = /^([A-Z0-9][A-Z0-9_-]*): /.exec(msg);
            if (m) {
                err.code = m[1];
            }
            throw err;
        }
        return JSON.parse(out);
    };

    const toBuffer = (body) => {
        if (body === undefined || body === null) return undefined;
        if (typeof body === 'string') return Buffer.from(body, 'utf8');
        if (body instanceof ArrayBuffer) return Buffer.from(body);
        if (ArrayBuffer.isView(body)) return Buffer.from(body.buffer, body.byteOffset, body.byteLength);
        if (body instanceof URLSearchParams) return Buffer.from(body.toString(), 'utf8');
        return Buffer.from(String(body), 'utf8');
    };

    const normHeaders = (h) => {
        const out = Object.create(null);
        if (!h) return out;
        const add = (k, v) => {
            k = String(k).toLowerCase();
            if (v === undefined) return;
            out[k] = out[k] === undefined ? (Array.isArray(v) ? v.map(String) : String(v))
                : [].concat(out[k], Array.isArray(v) ? v.map(String) : [String(v)]);
        };
        if (h instanceof Headers) {
            h.forEach((v, k) => add(k, v));
        } else if (Array.isArray(h)) {
            for (const [k, v] of h) add(k, v);
        } else {
            for (const k of Object.keys(h)) add(k, h[k]);
        }
        return out;
    };

    class Headers {
        #m = new Map();
        constructor(init) {
            if (init) {
                const n = normHeaders(init);
                for (const k of Object.keys(n)) this.#m.set(k, [].concat(n[k]).join(', '));
            }
        }
        get(k) { const v = this.#m.get(String(k).toLowerCase()); return v === undefined ? null : v; }
        set(k, v) { this.#m.set(String(k).toLowerCase(), String(v)); }
        has(k) { return this.#m.has(String(k).toLowerCase()); }
        append(k, v) {
            k = String(k).toLowerCase();
            this.#m.set(k, this.#m.has(k) ? this.#m.get(k) + ', ' + v : String(v));
        }
        delete(k) { this.#m.delete(String(k).toLowerCase()); }
        forEach(cb, thisArg) { for (const [k, v] of this.#m) cb.call(thisArg, v, k, this); }
        *entries() { yield* this.#m.entries(); }
        *keys() { yield* this.#m.keys(); }
        *values() { yield* this.#m.values(); }
        [Symbol.iterator]() { return this.entries(); }
    }

    class Response {
        #body;
        constructor(body, init = {}) {
            this.#body = toBuffer(body) || Buffer.alloc(0);
            this.status = init.status === undefined ? 200 : init.status;
            this.statusText = init.statusText || '';
            this.headers = init.headers instanceof Headers ? init.headers : new Headers(init.headers);
            this.url = init.url || '';
            this.redirected = !!init.redirected;
            this.type = 'basic';
            this.bodyUsed = false;
        }
        get ok() { return this.status >= 200 && this.status < 300; }
        get body() {
            const bytes = this.#body;
            const { ReadableStream } = require('stream/web');
            return new ReadableStream({ start(c) { if (bytes.length) c.enqueue(new Uint8Array(bytes)); c.close(); } });
        }
        async arrayBuffer() {
            this.bodyUsed = true;
            const b = this.#body;
            return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
        }
        async text() { this.bodyUsed = true; return this.#body.toString('utf8'); }
        async json() { return JSON.parse(await this.text()); }
        async bytes() { this.bodyUsed = true; return new Uint8Array(this.#body); }
        clone() {
            return new Response(Buffer.from(this.#body), {status: this.status, statusText: this.statusText,
                headers: new Headers(this.headers), url: this.url, redirected: this.redirected});
        }
    }

    class Request {
        constructor(input, init = {}) {
            const base = input instanceof Request ? input : null;
            this.url = base ? base.url : String(input);
            this.method = (init.method || (base && base.method) || 'GET').toUpperCase();
            this.headers = new Headers(init.headers || (base && base.headers));
            this.body = init.body !== undefined ? init.body : (base ? base.body : undefined);
            this.signal = init.signal || (base && base.signal);
            this.redirect = init.redirect || (base && base.redirect) || 'follow';
        }
    }

    const doRequest = (method, url, headers, body, timeout_ms, redirect) => {
        const b = toBuffer(body);
        const r = hostRequest({
            method,
            url,
            headers: normHeaders(headers),
            body_b64: b ? b.toString('base64') : undefined,
            timeout_ms,
            redirect,
        });
        return {
            status: r.status,
            statusText: r.status_text || '',
            headers: r.headers || {},
            body: r.body_b64 ? Buffer.from(r.body_b64, 'base64') : Buffer.alloc(0),
            url: r.url || url,
        };
    };

    const fetchShim = async (input, init = {}) => {
        const req = new Request(input, init);
        if (req.signal && req.signal.aborted) {
            const e = new Error('The operation was aborted');
            e.name = 'AbortError';
            throw e;
        }
        const body = req.body;
        if (body && typeof body === 'object' && typeof body.getReader === 'function') {
            throw denied('a streamed request body');
        }
        const r = doRequest(req.method, req.url, req.headers, body, undefined, req.redirect);
        return new Response(r.body, {status: r.status, statusText: r.statusText, headers: r.headers, url: r.url,
            redirected: r.url !== req.url});
    };

    // http and https: request() and get() with a ClientRequest and an IncomingMessage, enough for axios's node
    // adapter, follow-redirects and the SDKs that use them; a request is sent when it ends
    class IncomingMessage extends stream.Readable {
        constructor(r) {
            super({read() {}});
            this.statusCode = r.status;
            this.statusMessage = r.statusText;
            this.headers = Object.create(null);
            this.rawHeaders = [];
            for (const k of Object.keys(r.headers)) {
                const v = r.headers[k];
                this.headers[k.toLowerCase()] = Array.isArray(v) ? v.join(', ') : String(v);
                for (const one of [].concat(v)) this.rawHeaders.push(k, String(one));
            }
            this.httpVersion = '1.1';
            this.url = '';
            this.complete = true;
            this.responseUrl = r.url;
            if (r.body.length) this.push(r.body);
            this.push(null);
        }
        setTimeout() { return this; }
    }

    class ClientRequest extends stream.Writable {
        #chunks = [];
        #headers = Object.create(null);
        #timeout;
        #aborted = false;
        #ended = false;
        constructor(url, options, cb) {
            super({write: (chunk, enc, done) => { this.#chunks.push(toBuffer(chunk)); done(); }});
            this.url = url;
            this.method = (options.method || 'GET').toUpperCase();
            const h = options.headers || {};
            for (const k of Object.keys(h)) this.#headers[k.toLowerCase()] = h[k];
            if (options.timeout) this.#timeout = options.timeout;
            this.path = new URL(url).pathname;
            this.host = new URL(url).hostname;
            this.reusedSocket = false;
            this.socket = null;
            if (cb) this.once('response', cb);
        }
        setHeader(k, v) { this.#headers[String(k).toLowerCase()] = v; return this; }
        getHeader(k) { return this.#headers[String(k).toLowerCase()]; }
        getHeaders() { return {...this.#headers}; }
        getHeaderNames() { return Object.keys(this.#headers); }
        hasHeader(k) { return String(k).toLowerCase() in this.#headers; }
        removeHeader(k) { delete this.#headers[String(k).toLowerCase()]; }
        // write() and end() drive the request with setImmediate(): a callback of the event loop, after which Node runs
        // the ticks of the streams that the request and its response use (code that the host calls directly, with no
        // callback of the loop, does not run them)
        write(chunk, enc, cb) {
            if (typeof enc === 'function') { cb = enc; }
            if (chunk !== undefined && chunk !== null) this.#chunks.push(toBuffer(chunk));
            if (cb) setImmediate(cb);
            return true;
        }
        end(chunk, enc, cb) {
            if (typeof chunk === 'function') { cb = chunk; chunk = undefined; } else if (typeof enc === 'function') { cb = enc; }
            if (chunk !== undefined && chunk !== null) this.#chunks.push(toBuffer(chunk));
            if (this.#ended) return this;
            this.#ended = true;
            setImmediate(() => {
                this.emit('finish');
                if (cb) cb();
                this.#send();
            });
            return this;
        }
        setTimeout(ms, cb) { this.#timeout = ms; if (cb) this.once('timeout', cb); return this; }
        setNoDelay() {}
        setSocketKeepAlive() {}
        flushHeaders() {}
        abort() { this.#aborted = true; this.emit('abort'); this.destroy(); }
        #send() {
            if (this.#aborted || this.destroyed && this.#aborted) return;
            let r;
            try {
                r = doRequest(this.method, this.url, this.#headers, this.#chunks.length ? Buffer.concat(this.#chunks)
                    : undefined, this.#timeout, 'follow');
            } catch (e) {
                this.emit('error', e);
                return;
            }
            this.res = new IncomingMessage(r);
            this.emit('response', this.res);
        }
    }

    class Agent extends EventEmitter {
        constructor(options = {}) { super(); this.options = {...options}; this.maxSockets = Infinity; }
        destroy() {}
    }

    const makeHttp = (protocol) => {
        const toUrl = (input, options) => {
            if (typeof input === 'string' || input instanceof URL) {
                return {url: String(input), options: options || {}};
            }
            const o = input || {};
            const host = o.hostname || o.host || 'localhost';
            const port = o.port ? ':' + o.port : '';
            return {url: (o.protocol || protocol) + '//' + host + port + (o.path || '/'), options: o};
        };
        const request = (input, options, cb) => {
            if (typeof options === 'function') { cb = options; options = undefined; }
            const {url, options: o} = toUrl(input, options);
            return new ClientRequest(url, {...o, ...(options || {})}, cb);
        };
        const get = (input, options, cb) => { const r = request(input, options, cb); r.end(); return r; };
        const globalAgent = new Agent();
        return Object.freeze({request, get, Agent, globalAgent, ClientRequest, IncomingMessage,
            STATUS_CODES: Object.freeze({...require('_http_server').STATUS_CODES}),
            METHODS: Object.freeze(['DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT']),
            validateHeaderName: () => {}, validateHeaderValue: () => {}});
    };
    // process: the minimal process that is also the global
    shims.set('process', minimalProcess);
    // tty: no terminal; os: neutral values, no information about the host
    shims.set('tty', Object.freeze({isatty: () => false, ReadStream: class {}, WriteStream: class {}}));
    shims.set('os', Object.freeze({EOL: '\n', platform: () => realProcess.platform, type: () => 'Linux',
        arch: () => realProcess.arch, release: () => '', version: () => '', hostname: () => 'localhost',
        homedir: () => '/', tmpdir: () => '/tmp', endianness: () => 'LE', cpus: () => [], totalmem: () => 0,
        freemem: () => 0, uptime: () => 0, loadavg: () => [0, 0, 0], networkInterfaces: () => ({}),
        userInfo: () => ({username: '', uid: -1, gid: -1, shell: null, homedir: '/'}),
        constants: Object.freeze({signals: Object.freeze({}), errno: Object.freeze({})}), availableParallelism: () => 1,
        machine: () => realProcess.arch, devNull: '/dev/null'}));
    // http2: its constants (data only) for code that loads it, but no connection: requests use http/https or fetch
    shims.set('http2', Object.freeze({constants: Object.freeze({...require('http2').constants}),
        connect: () => { throw denied('http2'); }, createSecureServer: () => { throw denied('http2'); },
        createServer: () => { throw denied('http2'); }}));
    shims.set('http', makeHttp('http:'));
    shims.set('https', makeHttp('https:'));

    globalThis.fetch = fetchShim;
    globalThis.Headers = Headers;
    globalThis.Request = Request;
    globalThis.Response = Response;

    // ---- the main script ----
    // the main source runs as a global script, as the main source of an unrestricted program does (its top-level
    // declarations are globals), with the loader's own require() as the global require(): it refuses what the loader
    // refuses, and once the program is sealed it gives only what is loaded already
    const runMain = () => {
        globalThis.require = makeRequire(path.dirname(mainFilename));
        vm.runInThisContext(mainSource, {filename: mainFilename});
    };

    return {
        // runs the main script during the load phase, with process replaced
        load() {
            Object.defineProperty(globalThis, 'process', {value: minimalProcess, writable: false,
                configurable: false, enumerable: false});
            runMain();
        },
        // ends the load phase: the load-phase builtins are revoked and no file is loaded any more
        seal() {
            sealed = true;
        },
        isSealed() {
            return sealed;
        },
    };
})();

// the host seals the program before the first call for a caller (QoreV8Program::seal())
globalThis[Symbol.for('qore.restricted.control')] = Object.freeze({
    seal: () => _qoreR.seal(),
    isSealed: () => _qoreR.isSealed(),
});
_qoreR.load();
