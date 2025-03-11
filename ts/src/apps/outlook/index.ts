import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import L from '../../i18n/i18n-node';
import { OUTLOOK_APP_LOGO, OUTLOOK_APP_NAME } from './constants';
import * as OUTLOOK_TRIGGERS from './triggers';
import * as actions from './actions';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import { Locales } from '../../i18n/i18n-types';

const OUTLOOK_ACTIONS = Object.values(actions);

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[OUTLOOK_APP_NAME].displayName(),
    short_desc: L[locale].apps[OUTLOOK_APP_NAME].shortDesc(),
    desc: L[locale].apps[OUTLOOK_APP_NAME].longDesc(),
    name: OUTLOOK_APP_NAME,
    actions: [
      ...mapActionsToApp(OUTLOOK_APP_NAME, OUTLOOK_ACTIONS, locale),
      ...mapTriggersToApp(OUTLOOK_APP_NAME, OUTLOOK_TRIGGERS, locale),
    ],
    logo: OUTLOOK_APP_LOGO,
    logo_file_name: 'logo.svg',
    logo_mime_type: 'image/svg+xml',

    rest: {
      url: 'https://graph.microsoft.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      oauth2_token_url: `https://login.microsoftonline.com/common/oauth2/v2.0/token`,
      oauth2_scopes: [
        'User.Read',
        'Calendars.ReadWrite',
        'offline_access',
        'Contacts.ReadWrite',
        'Mail.Send',
        'Mail.ReadWrite',
      ],
      ping_path: '/v1.0/me',
    },
  }) satisfies TQoreAppWithActions;
