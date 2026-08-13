import hubspotApp from '../apps/hubspot';

describe('Hubspot OAuth endpoints', () => {
  const app = hubspotApp('en' as any);

  it('exchanges and refreshes tokens against the date-versioned OAuth API', () => {
    // `POST /oauth/v1/token` serves the authorization-code exchange *and every refresh*, so when
    // HubSpot sunsets it on 2027-02-16 connections do not degrade — they stop at the next refresh
    expect(app.rest.oauth2_token_url).toBe('https://api.hubapi.com/oauth/2026-03/token');
  });

  it('leaves the authorization URL on its unversioned host', () => {
    // only the v1 *API* endpoints are deprecated; the user-facing authorize URL is not one of them
    // and moving it in sympathy would break the consent redirect
    expect(app.rest.oauth2_auth_url).toBe('https://app.hubspot.com/oauth/authorize');
  });
});
