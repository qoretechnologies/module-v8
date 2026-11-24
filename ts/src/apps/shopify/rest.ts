// Copyright 2026 Qore Technologies, s.r.o.
import type { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_API_VERSION, SHOPIFY_CONN_OPTIONS, SHOPIFY_SCOPES } from './constants';

export { SHOPIFY_APP_NAME } from './constants';

/** OAuth connection metadata shared by the app catalog and the connection integration test. */
export const getShopifyRestOptions = () =>
  ({
    url: 'https://{{shop}}.myshopify.com',
    data: 'json',
    oauth2_grant_type: 'authorization_code',
    oauth2_auth_url: 'https://{{shop}}.myshopify.com/admin/oauth/authorize',
    oauth2_token_url: 'https://{{shop}}.myshopify.com/admin/oauth/access_token',
    oauth2_scopes: SHOPIFY_SCOPES,
    // Shopify answers the code exchange with a non-expiring offline token unless the request asks
    // for an expiring one, and it is retiring non-expiring tokens for public apps: an app still
    // using them takes no new installs from 2027-01-01 and has its Admin API requests refused from
    // 2027-04-01. With `expiring=1` the exchange returns a one-hour access token and a refresh
    // token that changes on every refresh.
    oauth2_token_args: {
      expiring: 1,
    },
    // Shopify takes the access token in this header, not in `Authorization`. The connection's
    // clients send the token they hold in it, so the header follows a token that a refresh
    // replaced, also in the request that made the refresh.
    token_api_key_header: 'X-Shopify-Access-Token',
    // the ping must ride the same version as the actions; hardcoding it left the connection test
    // calling a version sunset since 2024 while every action used the pinned one.
    //
    // This is the application's only remaining REST call — everything else is GraphQL — and it
    // stays REST deliberately. The REST Admin API has been legacy since 2024-10-01 and Shopify
    // removes resources in waves (the first, `products/count.json`, in October 2025), but `shop`
    // is in no announced wave and the version pinned here is supported to 2027-07-16. Moving the
    // ping to `graphql.json` would cost more than it buys: GraphQL answers an unauthorised or
    // under-scoped request with `200 OK` and an ACCESS_DENIED body, so a status-code ping would
    // report healthy for exactly the credential failures it exists to catch. Revisit if `shop`
    // is named in a wave, and then assert the body rather than the status.
    ping_path: `/admin/api/${SHOPIFY_API_VERSION}/shop.json`,
    ping_method: 'GET',
  }) satisfies TQoreAppWithActions['rest'];

/**
 * The connection's own options.
 *
 * There is no function that puts the token into the ping's headers after the code exchange, as
 * there was while the token never changed: a connection is pinged on a thread on which such a
 * function cannot be called, and that ping is what replaces an expiring token, so a header kept
 * that way stayed that of the token before. `token_api_key_header` above replaces it.
 */
export const getShopifyRestModifiers = () =>
  ({
    options: SHOPIFY_CONN_OPTIONS,
    required_options: 'shop',
    url_template_options: ['shop'],
  }) satisfies TQoreAppWithActions['rest_modifiers'];
