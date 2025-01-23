import { actionsCatalogue } from '../../ActionsCatalogue';
import { createSwaggerPaths, mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import { IQoreAppWithActions } from '../../global/models/qore';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { NetsuiteSuiteQlAction } from './actions/squite-ql.action';
import {
  NETSUITE_ACTIONS,
  NETSUITE_ALLOWED_PATHS,
  NETSUITE_APP_NAME,
  NETSUITE_CONN_OPTIONS,
} from './constants';
import * as NETSUITE_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[NETSUITE_APP_NAME].displayName(),
    short_desc: L[locale].apps[NETSUITE_APP_NAME].shortDesc(),
    name: NETSUITE_APP_NAME,
    desc: L[locale].apps[NETSUITE_APP_NAME].longDesc(),
    actions: [
      ...mapActionsToApp(NETSUITE_APP_NAME, [...NETSUITE_ACTIONS, NetsuiteSuiteQlAction], locale),
      ...mapTriggersToApp(NETSUITE_APP_NAME, NETSUITE_TRIGGERS, locale),
    ],
    logo:
      'PHN2ZyB2aWV3Qm94PSIwIDAuMiAxNTAgMTUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmc' +
      'iIHdpZHRoPSIyNTAwIiBoZWlnaHQ9IjI0OTciPjxwYXRoIGQ9Ik0wIC4yaDE1MHYxNTBIMHoiIGZpbGw9Im' +
      '5vbmUiLz48cGF0aCBkPSJNMjAuMSA0Ny43aDIzLjdWMTA0aDExLjh2MjJIMjAuMXptMTA5LjcgNTEuOGgtM' +
      'jMuN1Y0My4ySDk0LjN2LTIyaDM1LjV6IiBmaWxsPSIjYmFjY2RiIi8+PHBhdGggZD0iTTE0LjYgMTUuOGg3' +
      'NC45djY0LjNMNjAuNyA0M0gxNC42em0xMjAuNiAxMTUuN0g2MC4zVjY3LjJsMjguOCAzNy4xaDQ2LjEiIGZ' +
      'pbGw9IiMxMjU1ODAiLz48L3N2Zz4=',
    logo_file_name: 'netsuite-logo.svg',
    logo_mime_type: 'image/scg+xml',
    swagger: 'schemas/netsuite.swagger.json',
    swagger_paths: createSwaggerPaths(NETSUITE_ALLOWED_PATHS),
    rest: {
      url: 'https://{{account_id}}.suitetalk.api.netsuite.com/services/rest/record',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_client_id: 'b8eea47e7be3799b5b441f02bc099f1fed6213abc8ae099d07aa51764db2816e',
      oauth2_client_secret: actionsCatalogue.getOauth2ClientSecret(NETSUITE_APP_NAME),
      oauth2_auth_url: 'https://system.netsuite.com/app/login/oauth2/authorize.nl',
      oauth2_token_url:
        'https://{{account_id}}.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token',
      oauth2_scopes: ['rest_webservices'],
      ping_method: 'GET',
      ping_path: 'v1/vendor?limit=1',
    },
    rest_modifiers: {
      options: NETSUITE_CONN_OPTIONS,
      set_options_post_auth: (context) => {
        if (context.conn_opts.company) {
          return {
            account_id: context.conn_opts.company,
          };
        }
      },
    },
  }) satisfies IQoreAppWithActions;
