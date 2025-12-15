import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { SENDGRID_APP_LOGO, SENDGRID_APP_NAME, SENDGRID_CONN_OPTIONS } from './constants';

import * as SENDGRID_ACTIONS from './actions';

export default (locale: Locales) =>
  ({
    name: SENDGRID_APP_NAME,
    display_name: L[locale].apps[SENDGRID_APP_NAME].displayName(),
    short_desc: L[locale].apps[SENDGRID_APP_NAME].shortDesc(),
    desc: L[locale].apps[SENDGRID_APP_NAME].longDesc(),
    logo: SENDGRID_APP_LOGO,
    logo_file_name: 'sendgrid-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [...mapActionsToApp(SENDGRID_APP_NAME, SENDGRID_ACTIONS, locale)],
    rest: {
      url: 'https://api.sendgrid.com',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/v3/scopes',
      token_type: 'bearer',
    },
    rest_modifiers: {
      options: SENDGRID_CONN_OPTIONS,
      required_options: 'token',
    },
  }) satisfies TQoreAppWithActions;
