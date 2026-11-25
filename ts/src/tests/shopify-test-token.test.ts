// Copyright 2026 Qore Technologies, s.r.o.
import { requestShopifyTestToken } from './shopify-test-token';

type Env = Record<string, string | undefined>;

/** A fetch that answers every request the same way and keeps what it was asked */
function fakeFetch(answer: () => Promise<Partial<Response>> | Partial<Response>) {
  const requests: { url: string; init: RequestInit }[] = [];
  const fetch = (async (url: string, init: RequestInit) => {
    requests.push({ url, init });
    return answer();
  }) as unknown as typeof globalThis.fetch;
  return { fetch, requests };
}

/** Runs the request; returns the token and what was printed and asked */
async function run(env: Env, answer: () => Promise<Partial<Response>> | Partial<Response>) {
  const { fetch, requests } = fakeFetch(answer);
  const output: string[] = [];
  const token = await requestShopifyTestToken(env, { fetch, output: (line) => output.push(line) });
  return { token, output, requests };
}

const granted =
  (access_token = 'run-token') =>
  () => ({
    ok: true,
    status: 200,
    json: async () => ({ access_token, expires_in: 86399 }),
  });

const CREDENTIALS = {
  SHOPIFY_SHOP: 'a-test-store',
  SHOPIFY_CLIENT_ID: 'the-client-id',
  SHOPIFY_CLIENT_SECRET: 'the-client-secret',
};
const USES_RUN_TOKEN = 'the live Shopify suites use a token requested for this run';

describe("The live Shopify suites' token", () => {
  it('is asked from the store with the client credentials grant', async () => {
    const { token, output, requests } = await run({ ...CREDENTIALS }, granted());

    expect(token).toBe('run-token');
    expect(requests).toHaveLength(1);
    const { url, init } = requests[0];
    expect(url).toBe('https://a-test-store.myshopify.com/admin/oauth/access_token');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/x-www-form-urlencoded' });
    expect(Object.fromEntries(init.body as URLSearchParams)).toEqual({
      grant_type: 'client_credentials',
      client_id: 'the-client-id',
      client_secret: 'the-client-secret',
    });
    // a redirect is refused, so the secret reaches no second host, and the request is given up
    // if Shopify does not answer
    expect(init.redirect).toBe('error');
    expect(init.signal).toBeInstanceOf(AbortSignal);
    // the run's log says which token the suites use, and never the token
    expect(output).toEqual([USES_RUN_TOKEN]);
  });

  it('is masked in a GitHub workflow before anything else is printed', async () => {
    const { token, output } = await run({ ...CREDENTIALS, GITHUB_ACTIONS: 'true' }, granted());

    expect(token).toBe('run-token');
    expect(output).toEqual(['::add-mask::run-token', USES_RUN_TOKEN]);
  });

  it('is masked whole when it holds a percent sign, which the runner decodes in a command', async () => {
    const { token, output } = await run(
      { ...CREDENTIALS, GITHUB_ACTIONS: 'true' },
      granted('a%25b%0Ac')
    );

    expect(token).toBe('a%25b%0Ac');
    expect(output[0]).toBe('::add-mask::a%2525b%250Ac');
  });

  it('is not asked for without an app, and nothing is said: the suites keep the token they have', async () => {
    // a variable that the workflow's secret does not have arrives empty
    for (const env of [
      { SHOPIFY_SHOP: 'a-test-store', SHOPIFY_ACCESS_TOKEN: 'fixed-token' },
      { SHOPIFY_SHOP: 'a-test-store', SHOPIFY_CLIENT_ID: '', SHOPIFY_CLIENT_SECRET: '' },
      {},
    ] as Env[]) {
      expect(await run(env, granted())).toEqual({ token: undefined, output: [], requests: [] });
    }
  });

  it.each([
    ['SHOPIFY_CLIENT_SECRET', { SHOPIFY_CLIENT_SECRET: '' }, 'SHOPIFY_CLIENT_SECRET is not set'],
    ['SHOPIFY_CLIENT_ID', { SHOPIFY_CLIENT_ID: undefined }, 'SHOPIFY_CLIENT_ID is not set'],
    ['SHOPIFY_SHOP', { SHOPIFY_SHOP: '' }, 'SHOPIFY_SHOP is not set'],
    [
      'SHOPIFY_SHOP and SHOPIFY_CLIENT_ID',
      { SHOPIFY_SHOP: '', SHOPIFY_CLIENT_ID: '' },
      'SHOPIFY_SHOP and SHOPIFY_CLIENT_ID are not set',
    ],
  ])(
    'is not asked for with an app but without %s, and that is said',
    async (_name, unset, text) => {
      const { token, output, requests } = await run({ ...CREDENTIALS, ...unset }, granted());

      expect(token).toBeUndefined();
      expect(requests).toEqual([]);
      expect(output).toEqual([`warning: no token for the live Shopify suites: ${text}`]);
    }
  );

  it.each(['evil.example/x', 'a-test-store.myshopify.com', 'a store', 'store@evil.example'])(
    'does not send the secret anywhere for the store name "%s"',
    async (shop) => {
      const { token, output, requests } = await run(
        { ...CREDENTIALS, SHOPIFY_SHOP: shop },
        granted()
      );

      expect(token).toBeUndefined();
      expect(requests).toEqual([]);
      expect(output).toEqual([
        'warning: no token for the live Shopify suites: SHOPIFY_SHOP is not the name of a store ' +
          '(the part before .myshopify.com)',
      ]);
    }
  );

  const refused = () =>
    Promise.reject(
      Object.assign(new TypeError('fetch failed'), {
        cause: Object.assign(new Error('connect ECONNREFUSED the-client-secret'), {
          code: 'ECONNREFUSED',
        }),
      })
    );
  it.each([
    [
      'a refusal',
      () => ({ ok: false, status: 401, json: async () => ({ error: 'the-client-secret' }) }),
      'Shopify answered the token request with HTTP 401',
    ],
    [
      'a request that gets no connection',
      refused,
      'the token request failed (TypeError: ECONNREFUSED)',
    ],
    [
      'a request that fails with no code, such as a redirect',
      () => Promise.reject(new TypeError('redirect to the-client-secret')),
      'the token request failed (TypeError)',
    ],
    [
      'an answer that is not JSON',
      () => ({ ok: true, status: 200, json: () => Promise.reject(new SyntaxError('<html>')) }),
      'the token request failed (SyntaxError)',
    ],
    [
      'an answer without a token',
      () => ({ ok: true, status: 200, json: async () => ({ scope: 'read_products' }) }),
      "Shopify's answer has no usable access_token",
    ],
    [
      'a token that is not one word',
      granted('a\nb'),
      "Shopify's answer has no usable access_token",
    ],
  ])('%s is one warning, gives no token and does not fail the run', async (_name, answer, text) => {
    const { token, output, requests } = await run(
      { ...CREDENTIALS, GITHUB_ACTIONS: 'true' },
      answer as () => Partial<Response>
    );

    expect(token).toBeUndefined();
    expect(requests).toHaveLength(1);
    // neither the secret nor anything the other side sent is in the message
    expect(output).toEqual([`::warning::no token for the live Shopify suites: ${text}`]);
  });
});
