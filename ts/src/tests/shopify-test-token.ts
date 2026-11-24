// Copyright 2026 Qore Technologies, s.r.o.
//
// The access token of the live Shopify suites. Shopify is retiring offline tokens that do not
// expire, so the suites cannot keep one fixed token in the workflow's secret. With the client ID
// and the client secret of an app of our own organization, a run asks for a token itself with the
// client credentials grant; that token is valid for 24 hours.
// https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials-grant

/** What the token request needs from outside, so that a test can stand in for both */
export interface ShopifyTestTokenIo {
  fetch: typeof fetch;
  output: (line: string) => void;
}

/** Shopify answers within a second or two; a request that takes longer than this is given up */
const TOKEN_REQUEST_TIMEOUT_MS = 30_000;

/**
 * Gives the live Shopify suites a token for this run.
 *
 * With SHOPIFY_SHOP, SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET set, asks Shopify for a token and
 * puts it into SHOPIFY_ACCESS_TOKEN, which the suites read. Without them nothing is requested, and
 * a SHOPIFY_ACCESS_TOKEN that is already set stays as it is.
 *
 * A request that fails is reported and changes nothing: a live service that does not answer must
 * not stop the offline suites of the same run. In a GitHub workflow the token is masked in the
 * job's log before it is set, because it is not a value of any secret and GitHub would print it.
 *
 * @returns true if SHOPIFY_ACCESS_TOKEN was set from a token request
 */
export async function setShopifyTestToken(
  env: Record<string, string | undefined>,
  io: ShopifyTestTokenIo
): Promise<boolean> {
  const {
    SHOPIFY_SHOP: shop,
    SHOPIFY_CLIENT_ID: clientId,
    SHOPIFY_CLIENT_SECRET: clientSecret,
  } = env;
  if (!shop || !clientId || !clientSecret) {
    return false;
  }
  const inWorkflow = env.GITHUB_ACTIONS === 'true';
  const warn = (text: string) =>
    io.output(
      `${inWorkflow ? '::warning::' : 'warning: '}no token for the live Shopify suites: ${text}`
    );

  // the secret goes to this host: only a store's own subdomain makes it a Shopify host
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(shop)) {
    warn('SHOPIFY_SHOP is not the name of a store (the part before .myshopify.com)');
    return false;
  }

  let token: unknown;
  try {
    const response = await io.fetch(`https://${shop}.myshopify.com/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
      signal: AbortSignal.timeout(TOKEN_REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) {
      // the body is not quoted: nothing of a refused request belongs in a log
      warn(`Shopify answered the token request with HTTP ${response.status}`);
      return false;
    }
    token = (await response.json())?.access_token;
  } catch (error) {
    warn(`the token request failed (${error instanceof Error ? error.name : 'error'})`);
    return false;
  }
  // one printable word: anything else cannot be masked as one workflow command
  if (typeof token !== 'string' || !/^[\x21-\x7e]+$/.test(token)) {
    warn("Shopify's answer has no usable access_token");
    return false;
  }

  if (inWorkflow) {
    io.output(`::add-mask::${token}`);
  }
  env.SHOPIFY_ACCESS_TOKEN = token;
  return true;
}
