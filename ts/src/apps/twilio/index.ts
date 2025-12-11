import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import {
  TWILIO_API_VERSION,
  TWILIO_APP_LOGO,
  TWILIO_APP_NAME,
  TWILIO_CONN_OPTIONS,
} from './constants';

import * as TWILIO_ACTIONS from './actions';
import * as TWILIO_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: TWILIO_APP_NAME,
    display_name: L[locale].apps[TWILIO_APP_NAME].displayName(),
    short_desc: L[locale].apps[TWILIO_APP_NAME].shortDesc(),
    desc: L[locale].apps[TWILIO_APP_NAME].longDesc(),
    logo: TWILIO_APP_LOGO,
    logo_file_name: 'twilio-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(TWILIO_APP_NAME, TWILIO_ACTIONS, locale),
      ...mapTriggersToApp(TWILIO_APP_NAME, TWILIO_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api.twilio.com',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: `/${TWILIO_API_VERSION}/Accounts.json`,
    },
    rest_modifiers: {
      options: TWILIO_CONN_OPTIONS,
      required_options: 'username,password',
    },
  }) satisfies TQoreAppWithActions;
