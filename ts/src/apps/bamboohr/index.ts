/**
 * BambooHR App Integration
 *
 * Provides employee management actions for BambooHR.
 * Uses OAuth2 authentication with company_domain for URL templating.
 *
 * @see https://documentation.bamboohr.com/reference
 */

import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers/index';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import {
  BAMBOOHR_APP_LOGO,
  BAMBOOHR_APP_NAME,
  BAMBOOHR_BASE_URL,
  BAMBOOHR_CONN_OPTIONS,
  BAMBOOHR_OAUTH2_SCOPES,
} from './constants';

import * as BAMBOOHR_ACTIONS from './actions';
import * as BAMBOOHR_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: BAMBOOHR_APP_NAME,
    display_name: L[locale].apps[BAMBOOHR_APP_NAME].displayName(),
    short_desc: L[locale].apps[BAMBOOHR_APP_NAME].shortDesc(),
    desc: L[locale].apps[BAMBOOHR_APP_NAME].longDesc(),
    actions: [
      ...mapActionsToApp(BAMBOOHR_APP_NAME, BAMBOOHR_ACTIONS, locale),
      ...mapTriggersToApp(BAMBOOHR_APP_NAME, BAMBOOHR_TRIGGERS, locale),
    ],
    logo: BAMBOOHR_APP_LOGO,
    logo_file_name: 'bamboohr-logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: BAMBOOHR_BASE_URL,
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://{{company_domain}}.bamboohr.com/authorize.php',
      oauth2_token_url: 'https://{{company_domain}}.bamboohr.com/token.php',
      oauth2_scopes: BAMBOOHR_OAUTH2_SCOPES,
      ping_method: 'GET',
      ping_path: '/{{company_domain}}/v1/meta/fields',
      ping_headers: {
        Accept: 'application/json',
      },
    },
    rest_modifiers: {
      options: BAMBOOHR_CONN_OPTIONS,
      required_options: 'company_domain',
      url_template_options: ['company_domain'],
    },
  }) satisfies TQoreAppWithActions;
