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

/** Returns what may be said about a failed request: the error's name and, if it has one, its code */
function failure(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'error';
  }
  const code = (error.cause as { code?: unknown } | undefined)?.code;
  return typeof code === 'string' && /^[A-Z0-9_]+$/.test(code)
    ? `${error.name}: ${code}`
    : error.name;
}

/**
 * Asks Shopify for the token of this run's live Shopify suites.
 *
 * The request is made with SHOPIFY_SHOP, SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET. Without a
 * client ID and a client secret nothing is requested and nothing is said: the suites then use the
 * SHOPIFY_ACCESS_TOKEN they have, or skip. With only some of the three, that is reported.
 *
 * A request that fails is reported as a warning and gives no token: a live service that does not
 * answer must not stop the offline suites of the same run. A granted token is reported in one
 * line, so that a run's log shows which token its suites used. In a GitHub workflow the token is
 * masked in the job's log before it is returned, because it is not a value of any secret and
 * GitHub would print it.
 *
 * @returns the token, or undefined if none was requested or granted
 */
export async function requestShopifyTestToken(
  env: Record<string, string | undefined>,
  io: ShopifyTestTokenIo
): Promise<string | undefined> {
  const credentials = {
    SHOPIFY_SHOP: env.SHOPIFY_SHOP,
    SHOPIFY_CLIENT_ID: env.SHOPIFY_CLIENT_ID,
    SHOPIFY_CLIENT_SECRET: env.SHOPIFY_CLIENT_SECRET,
  };
  const {
    SHOPIFY_SHOP: shop,
    SHOPIFY_CLIENT_ID: clientId,
    SHOPIFY_CLIENT_SECRET: clientSecret,
  } = credentials;
  const inWorkflow = env.GITHUB_ACTIONS === 'true';
  const warn = (text: string) =>
    io.output(
      `${inWorkflow ? '::warning::' : 'warning: '}no token for the live Shopify suites: ${text}`
    );

  if (!shop || !clientId || !clientSecret) {
    if (clientId || clientSecret) {
      const missing = Object.entries(credentials)
        .filter(([, value]) => !value)
        .map(([name]) => name);
      warn(`${missing.join(' and ')} ${missing.length > 1 ? 'are' : 'is'} not set`);
    }
    return undefined;
  }
  // the secret goes to this host: only a store's own subdomain makes it a Shopify host
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(shop)) {
    warn('SHOPIFY_SHOP is not the name of a store (the part before .myshopify.com)');
    return undefined;
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
      // the grant has no redirect, and a redirect that keeps the method would carry the secret on
      redirect: 'error',
      signal: AbortSignal.timeout(TOKEN_REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) {
      // the body is not quoted: nothing of a refused request belongs in a log
      warn(`Shopify answered the token request with HTTP ${response.status}`);
      return undefined;
    }
    token = (await response.json())?.access_token;
  } catch (error) {
    warn(`the token request failed (${failure(error)})`);
    return undefined;
  }
  // one printable word: anything else cannot be masked as one workflow command
  if (typeof token !== 'string' || !/^[\x21-\x7e]+$/.test(token)) {
    warn("Shopify's answer has no usable access_token");
    return undefined;
  }

  if (inWorkflow) {
    // the runner decodes percent escapes in a command's data
    io.output(`::add-mask::${token.replace(/%/g, '%25')}`);
  }
  io.output('the live Shopify suites use a token requested for this run');
  return token;
}
