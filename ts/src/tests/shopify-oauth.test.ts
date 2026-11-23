// Copyright 2026 Qore Technologies, s.r.o.
import shopifyApp from '../apps/shopify';

describe('Shopify OAuth token request', () => {
  const app = shopifyApp('en');

  it('asks the code exchange for an expiring offline token', () => {
    // without `expiring=1` Shopify issues a non-expiring offline token, and it is retiring those
    // for public apps: no new installs from 2027-01-01, no Admin API requests from 2027-04-01
    expect(app.rest.oauth2_token_args).toEqual({ expiring: 1 });
  });
});
