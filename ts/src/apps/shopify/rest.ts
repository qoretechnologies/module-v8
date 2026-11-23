// Copyright 2026 Qore Technologies, s.r.o.
import type { TQoreAppWithActions, TQoreMappedOptions } from '@qoretechnologies/ts-toolkit';
import {
  SHOPIFY_API_VERSION,
  SHOPIFY_CONN_OPTIONS,
  SHOPIFY_POST_AUTH_CODE_CONN_OPTIONS,
  SHOPIFY_SCOPES,
} from './constants';

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
 * The connection's own options and the hook that keeps Shopify's token header in step with the
 * token.
 *
 * Shopify takes the access token in `X-Shopify-Access-Token`, not in `Authorization`, so the ping
 * carries it in `ping_headers`. The hook runs after the code exchange and after every refresh, with
 * the new token: an expiring token is replaced every hour, and a ping that kept the header of the
 * token before it would be refused once that token ran out.
 */
export const getShopifyRestModifiers = () =>
  ({
    options: SHOPIFY_CONN_OPTIONS,
    required_options: 'shop',
    url_template_options: ['shop'],
    set_options_post_auth_code: (
      context
    ): TQoreMappedOptions<typeof SHOPIFY_POST_AUTH_CODE_CONN_OPTIONS> => {
      const token = context?.conn_opts?.token;
      if (!token) {
        return {
          ping_headers: {},
        };
      }

      return {
        ping_headers: {
          'X-Shopify-Access-Token': token,
        },
      };
    },
  }) satisfies TQoreAppWithActions['rest_modifiers'];
