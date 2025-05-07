import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import * as ATTIO_ACTIONS from './actions';
import * as ATTIO_TRIGGERS from './triggers';
import { ATTIO_APP_API_URL, ATTIO_APP_LOGO, ATTIO_APP_NAME } from './constants';

export default (locale: Locales) =>
  ({
    name: ATTIO_APP_NAME,
    display_name: L[locale].apps[ATTIO_APP_NAME].displayName(),
    short_desc: L[locale].apps[ATTIO_APP_NAME].shortDesc(),
    desc: L[locale].apps[ATTIO_APP_NAME].longDesc(),
    logo: ATTIO_APP_LOGO,
    logo_file_name: 'attio-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(ATTIO_APP_NAME, ATTIO_ACTIONS, locale),
      ...mapTriggersToApp(ATTIO_APP_NAME, ATTIO_TRIGGERS, locale),
    ],
    rest: {
      url: ATTIO_APP_API_URL,
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://app.attio.com/authorize',
      oauth2_token_url: 'https://app.attio.com/oauth/token',
      ping_method: 'GET',
      ping_path: '/v2/self',
    },
  }) satisfies TQoreAppWithActions;
