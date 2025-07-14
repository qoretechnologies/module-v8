import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { CLICKUP_APP_LOGO, CLICKUP_APP_NAME } from './constants';

export default (locale: Locales) =>
  ({
    name: CLICKUP_APP_NAME,
    display_name: L[locale].apps[CLICKUP_APP_NAME].displayName(),
    short_desc: L[locale].apps[CLICKUP_APP_NAME].shortDesc(),
    desc: L[locale].apps[CLICKUP_APP_NAME].longDesc(),
    logo: CLICKUP_APP_LOGO,
    logo_file_name: 'clickup-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [],
    rest: {
      url: 'https://api.clickup.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://app.clickup.com/api',
      oauth2_token_url: 'https://api.clickup.com/api/v2/oauth/token',
      ping_method: 'GET',
      ping_path: '/api/v2/user',
    },
  }) satisfies TQoreAppWithActions;
