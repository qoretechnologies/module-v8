// Copyright 2026 Qore Technologies, s.r.o.
import shopifyApp from '../apps/shopify';
import { getShopifyRestModifiers, getShopifyRestOptions } from '../apps/shopify/rest';

describe('Shopify OAuth token request', () => {
  const app = shopifyApp('en');

  it('uses the connection metadata exercised by the Qore integration fixture', () => {
    expect(app.rest).toEqual(getShopifyRestOptions());
    expect(Object.keys(app.rest_modifiers)).toEqual(Object.keys(getShopifyRestModifiers()));
  });

  it("has the connection's clients send the token in Shopify's own header", () => {
    expect(app.rest.token_api_key_header).toBe('X-Shopify-Access-Token');
    // and no function that copies the token into the ping's headers: a refresh made by the
    // connection's ping could not call it, so the copy stayed that of the token before
    expect(app.rest_modifiers).not.toHaveProperty('set_options_post_auth_code');
    expect(app.rest_modifiers).not.toHaveProperty('set_options_post_auth');
  });

  it('asks the code exchange for an expiring offline token', () => {
    // without `expiring=1` Shopify issues a non-expiring offline token, and it is retiring those
    // for public apps: no new installs from 2027-01-01, no Admin API requests from 2027-04-01
    expect(app.rest.oauth2_token_args).toEqual({ expiring: 1 });
  });
});
