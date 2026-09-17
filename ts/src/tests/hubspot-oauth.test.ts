// Copyright 2026 Qore Technologies, s.r.o.
import hubspotApp from '../apps/hubspot';
import { getHubspotRestOptions } from '../apps/hubspot/rest';

describe('Hubspot OAuth endpoints', () => {
  const app = hubspotApp('en');

  it('uses the connection metadata exercised by the Qore integration fixture', () => {
    expect(app.rest).toEqual(getHubspotRestOptions());
  });

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

  it('requests CMS permissions only as optional scopes', () => {
    expect(app.rest.oauth2_auth_args.optional_scope.split(' ')).toEqual([
      'content',
      'cms.domains.read',
    ]);
    expect(app.rest.oauth2_scopes).not.toContain('content');
    expect(app.rest.oauth2_scopes).not.toContain('cms.domains.read');
    expect(app.rest.oauth2_scopes).toEqual([
      'media_bridge.read',
      'oauth',
      'crm.objects.tickets.read',
      'crm.objects.tickets.write',
      'crm.schemas.tickets.read',
      'crm.schemas.tickets.write',
      'e-commerce',
      'crm.objects.custom.read',
      'crm.objects.custom.write',
      'crm.schemas.custom.read',
      'crm.schemas.contacts.read',
      'crm.objects.contacts.read',
      'crm.objects.contacts.write',
      'crm.schemas.deals.read',
      'crm.objects.deals.read',
      'crm.objects.deals.write',
      'crm.schemas.companies.read',
      'crm.objects.companies.read',
      'crm.objects.companies.write',
      'crm.objects.leads.read',
      'crm.objects.leads.write',
      'crm.objects.users.read',
      'crm.objects.users.write',
      'crm.lists.read',
      'crm.lists.write',
      'forms',
    ]);
  });

  it('does not request file, template or domain write permissions', () => {
    const scopes = [
      ...app.rest.oauth2_scopes,
      ...app.rest.oauth2_auth_args.optional_scope.split(' '),
    ];
    expect(scopes).not.toContain('files');
    expect(scopes.some((scope) => scope.startsWith('files.'))).toBe(false);
    expect(scopes.some((scope) => scope === 'hubdb' || scope.startsWith('hubdb.'))).toBe(false);
    expect(scopes).not.toContain('tickets');
    expect(scopes).not.toContain('cms.domains.write');
    expect(scopes).not.toContain('cms.source_code.read');
    expect(scopes).not.toContain('cms.source_code.write');
  });
});
