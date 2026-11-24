// Copyright 2026 Qore Technologies, s.r.o.
import { setShopifyTestToken } from './shopify-test-token';

/** A fetch that answers every request the same way and keeps what it was asked */
function fakeFetch(answer: () => Promise<Partial<Response>> | Partial<Response>) {
  const requests: { url: string; init: RequestInit }[] = [];
  const fetch = (async (url: string, init: RequestInit) => {
    requests.push({ url, init });
    return answer();
  }) as unknown as typeof globalThis.fetch;
  return { fetch, requests };
}

const granted = () => ({
  ok: true,
  status: 200,
  json: async () => ({ access_token: 'run-token', expires_in: 86399 }),
});

const CREDENTIALS = {
  SHOPIFY_SHOP: 'a-test-store',
  SHOPIFY_CLIENT_ID: 'the-client-id',
  SHOPIFY_CLIENT_SECRET: 'the-client-secret',
};

describe("The live Shopify suites' token", () => {
  it('is asked from the store with the client credentials grant and replaces a fixed token', async () => {
    const { fetch, requests } = fakeFetch(granted);
    const output: string[] = [];
    const env: Record<string, string | undefined> = {
      ...CREDENTIALS,
      SHOPIFY_ACCESS_TOKEN: 'fixed-token',
    };

    expect(await setShopifyTestToken(env, { fetch, output: (line) => output.push(line) })).toBe(
      true
    );

    expect(env.SHOPIFY_ACCESS_TOKEN).toBe('run-token');
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe('https://a-test-store.myshopify.com/admin/oauth/access_token');
    expect(requests[0].init.method).toBe('POST');
    expect(Object.fromEntries(requests[0].init.body as URLSearchParams)).toEqual({
      grant_type: 'client_credentials',
      client_id: 'the-client-id',
      client_secret: 'the-client-secret',
    });
    // outside a workflow nothing is printed, least of all the token
    expect(output).toEqual([]);
  });

  it('is masked in a GitHub workflow, in one command and nothing else', async () => {
    const { fetch } = fakeFetch(granted);
    const output: string[] = [];
    const env: Record<string, string | undefined> = { ...CREDENTIALS, GITHUB_ACTIONS: 'true' };

    expect(await setShopifyTestToken(env, { fetch, output: (line) => output.push(line) })).toBe(
      true
    );

    expect(output).toEqual(['::add-mask::run-token']);
    expect(env.SHOPIFY_ACCESS_TOKEN).toBe('run-token');
  });

  it.each(['SHOPIFY_SHOP', 'SHOPIFY_CLIENT_ID', 'SHOPIFY_CLIENT_SECRET'])(
    'is not asked for without %s, and a fixed token stays',
    async (missing) => {
      const { fetch, requests } = fakeFetch(granted);
      const output: string[] = [];
      // an unset variable arrives empty from the workflow's secret
      const env: Record<string, string | undefined> = {
        ...CREDENTIALS,
        SHOPIFY_ACCESS_TOKEN: 'fixed-token',
        [missing]: '',
      };

      expect(await setShopifyTestToken(env, { fetch, output: (line) => output.push(line) })).toBe(
        false
      );

      expect(requests).toEqual([]);
      expect(output).toEqual([]);
      expect(env.SHOPIFY_ACCESS_TOKEN).toBe('fixed-token');
    }
  );

  it.each(['evil.example/x', 'a-test-store.myshopify.com', 'a store', ''])(
    'does not send the secret anywhere for the store name "%s"',
    async (shop) => {
      const { fetch, requests } = fakeFetch(granted);
      const env: Record<string, string | undefined> = { ...CREDENTIALS, SHOPIFY_SHOP: shop };

      expect(await setShopifyTestToken(env, { fetch, output: () => undefined })).toBe(false);

      expect(requests).toEqual([]);
      expect(env.SHOPIFY_ACCESS_TOKEN).toBeUndefined();
    }
  );

  it.each([
    [
      'a refusal',
      () => ({ ok: false, status: 401, json: async () => ({ error: 'the-client-secret' }) }),
      /HTTP 401/,
    ],
    [
      'a request that fails',
      () => Promise.reject(new TypeError('fetch failed for the-client-secret')),
      /the token request failed \(TypeError\)/,
    ],
    [
      'an answer that is not JSON',
      () => ({ ok: true, status: 200, json: () => Promise.reject(new SyntaxError('<html>')) }),
      /the token request failed \(SyntaxError\)/,
    ],
    [
      'an answer without a token',
      () => ({ ok: true, status: 200, json: async () => ({ scope: 'read_products' }) }),
      /no usable access_token/,
    ],
    [
      'a token that is not one word',
      () => ({ ok: true, status: 200, json: async () => ({ access_token: 'a\nb' }) }),
      /no usable access_token/,
    ],
  ])(
    '%s is reported as a warning, changes nothing and does not fail the run',
    async (_name, answer, warning) => {
      const { fetch } = fakeFetch(answer as () => Partial<Response>);
      const output: string[] = [];
      const env: Record<string, string | undefined> = {
        ...CREDENTIALS,
        SHOPIFY_ACCESS_TOKEN: 'fixed-token',
        GITHUB_ACTIONS: 'true',
      };

      expect(await setShopifyTestToken(env, { fetch, output: (line) => output.push(line) })).toBe(
        false
      );

      expect(env.SHOPIFY_ACCESS_TOKEN).toBe('fixed-token');
      expect(output).toHaveLength(1);
      expect(output[0]).toMatch(/^::warning::no token for the live Shopify suites: /);
      expect(output[0]).toMatch(warning);
      // neither the secret nor anything the other side sent is in the message
      expect(output[0]).not.toContain('the-client-secret');
    }
  );
});
