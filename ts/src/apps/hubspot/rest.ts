// Copyright 2026 Qore Technologies, s.r.o.
import type { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { getOauth2ClientSecret } from '../../utils/oauth2-client-secret';

export const HUBSPOT_APP_NAME = 'Hubspot';

/**
 * The date-based version of HubSpot's OAuth API this application authenticates against.
 *
 * HubSpot sunsets the v1 OAuth API on 2027-02-16, and `POST /oauth/v1/token` served both the
 * authorization-code exchange **and every refresh** — so connections do not degrade as the date
 * passes, they stop at the next refresh, all at once. New listings, certification submissions and
 * recertifications are already required to be on the versioned endpoints.
 *
 * The replacement keeps the same host and the same `application/x-www-form-urlencoded` request
 * encoding and returns an identical response body, so this is a path change only.
 */
export const HUBSPOT_OAUTH_API_VERSION = '2026-03';

/** OAuth connection metadata shared by the app catalog and connection integration tests. */
export const getHubspotRestOptions = () =>
  ({
    url: 'https://api.hubapi.com',
    data: 'json',
    oauth2_grant_type: 'authorization_code',
    oauth2_client_id: '483b815d-b266-46c0-8dd5-c84bdb6c1331',
    oauth2_client_secret: getOauth2ClientSecret(HUBSPOT_APP_NAME),
    oauth2_auth_url: 'https://app.hubspot.com/oauth/authorize',
    oauth2_token_url: `https://api.hubapi.com/oauth/${HUBSPOT_OAUTH_API_VERSION}/token`,
    // Keep these optional in the external HubSpot developer app as well.
    // The REST connection verifies the actual grant before making CMS requests.
    oauth2_auth_args: {
      optional_scope: 'content cms.domains.read',
    },
    oauth2_scopes: [
      'media_bridge.read',
      'oauth',
      // Match HubSpot's granular replacement of the legacy tickets grant.
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
    ],
    ping_method: 'GET',
    ping_path: '/integrations/v1/me',
  }) satisfies TQoreAppWithActions['rest'];
