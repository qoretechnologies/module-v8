import { mapActionsToApp } from '../../global/helpers';
import { IQoreAppWithActions } from '../../global/models/qore';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { FRESHDESK_ACTIONS, FRESHDESK_APP_NAME, FRESHDESK_CONN_OPTIONS } from './constants';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[FRESHDESK_APP_NAME].displayName(),
    short_desc: L[locale].apps[FRESHDESK_APP_NAME].shortDesc(),
    desc: L[locale].apps[FRESHDESK_APP_NAME].longDesc(),
    name: FRESHDESK_APP_NAME,
    actions: [...mapActionsToApp(FRESHDESK_APP_NAME, FRESHDESK_ACTIONS, locale)],
    logo: 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICIt',
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
