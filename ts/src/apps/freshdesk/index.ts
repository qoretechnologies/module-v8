import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import { IQoreAppWithActions } from '../../global/models/qore';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { FRESHDESK_ACTIONS, FRESHDESK_APP_NAME, FRESHDESK_CONN_OPTIONS } from './constants';
import * as FRESHDESK_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[FRESHDESK_APP_NAME].displayName(),
    short_desc: L[locale].apps[FRESHDESK_APP_NAME].shortDesc(),
    desc: L[locale].apps[FRESHDESK_APP_NAME].longDesc(),
    name: FRESHDESK_APP_NAME,
    actions: [
      ...mapActionsToApp(FRESHDESK_APP_NAME, FRESHDESK_ACTIONS, locale),
      ...mapTriggersToApp(FRESHDESK_APP_NAME, FRESHDESK_TRIGGERS, locale),
    ],
    logo:
      `PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCI+P` +
      `HBhdGggZD0iTTMxLjkgMGgyNC4wMzZBOCA4IDAgMCAxIDY0IDguMDczVjMyLjFDNjQgNDkuNzIyIDQ5LjcyMiA2NCAz` +
      `Mi4xIDY0aC0uMTgyQTMxLjg5IDMxLjg5IDAgMCAxIDAgMzIuMTA5QzAgMTQuNDM3IDE0LjI1NC4xODIgMzEuOSAweiI` +
      `gZmlsbD0iIzI1YzE2ZiIvPjxwYXRoIGQ9Ik0zMS45IDE0LjI1NWMtOC4wOTMgMC0xNC42NTQgNi41Ni0xNC42NTQgMTQ` +
      `uNjU0djkuOTY0Yy4wNTggMi42NjcgMi4yMDYgNC44MTUgNC44NzMgNC44NzNoNC4xNDVWMzIuM2gtNS42di0zLjJjLjM` +
      `0LTYuMDI2IDUuMzI3LTEwLjc0IDExLjM2NC0xMC43NFM0My4wNCAyMy4wNjUgNDMuMzggMjkuMXYzLjJIMzcuN3YxMS4` +
      `0NTRoMy43NDV2LjE4MmMtLjA0IDIuNDc0LTIuMDM1IDQuNDctNC41IDQuNWgtNC40NzNjLS4zNjQgMC0uNzY0LjE4Mi0` +
      `uNzY0LjU0NWEuOC44IDAgMCAwIC43NjQuNzY0aDQuNWMzLjIwNS0uMDIgNS43OTgtMi42MTMgNS44MTgtNS44MTh2LS4` +
      `zNjRhNC44IDQuOCAwIDAgMCAzLjc0NS00LjcyN1YyOS4xYy4xODItOC4yNTQtNi4zNjQtMTQuODM2LTE0LjY1NC0xNC4` +
      `4MzZ6IiBmaWxsPSIjZmZmIi8+PC9zdmc+`,
    logo_file_name: 'freshdesk-logo.svg',
    logo_mime_type: 'image/svg+xml',
    swagger: 'schemas/freshdesk.swagger.json',
    swagger_options: {
      parse_flags: 128,
    },
    rest: {
      url: 'https://{{subdomain}}.freshdesk.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://{{subdomain}}.freshdesk.com/oauth/authorize',
      oauth2_token_url: 'https://{{subdomain}}.freshdesk.com/oauth/token',
      ping_method: 'GET',
      ping_path: '/api/v2/agents/me',
    },
    rest_modifiers: {
      options: FRESHDESK_CONN_OPTIONS,
      required_options: 'subdomain',
      url_template_options: ['subdomain'],
    },
  }) satisfies IQoreAppWithActions;
