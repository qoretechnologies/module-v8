// Copyright 2026 Qore Technologies, s.r.o.
import shopifyApp from '../apps/shopify';
import { getShopifyRestModifiers, getShopifyRestOptions } from '../apps/shopify/rest';

describe('Shopify OAuth token request', () => {
  const app = shopifyApp('en');

  it('uses the connection metadata exercised by the Qore integration fixture', () => {
    expect(app.rest).toEqual(getShopifyRestOptions());
    expect(Object.keys(app.rest_modifiers)).toEqual(Object.keys(getShopifyRestModifiers()));
  });

  it("puts the token in Shopify's own header after the code exchange and after a refresh", () => {
    // the hook is given the connection's options with the token of the answer it follows
    const hook = app.rest_modifiers.set_options_post_auth_code;
    expect(hook({ conn_opts: { token: 'the-new-token' } } as any)).toEqual({
      ping_headers: { 'X-Shopify-Access-Token': 'the-new-token' },
    });
    expect(hook({ conn_opts: {} } as any)).toEqual({ ping_headers: {} });
  });

  it('asks the code exchange for an expiring offline token', () => {
    // without `expiring=1` Shopify issues a non-expiring offline token, and it is retiring those
    // for public apps: no new installs from 2027-01-01, no Admin API requests from 2027-04-01
    expect(app.rest.oauth2_token_args).toEqual({ expiring: 1 });
  });
});
