import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { SERENITY_APP_LOGO, SERENITY_APP_NAME, SERENITY_CONN_OPTIONS } from './constants';
import * as actions from './actions';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import * as SERENITY_TRIGGERS from './triggers';

const SERENITY_ACTIONS = Object.values(actions);

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[SERENITY_APP_NAME].displayName(),
    short_desc: L[locale].apps[SERENITY_APP_NAME].shortDesc(),
    desc: L[locale].apps[SERENITY_APP_NAME].longDesc(),
    name: SERENITY_APP_NAME,
    actions: [
      ...mapActionsToApp(SERENITY_APP_NAME, SERENITY_ACTIONS, locale),
      ...mapTriggersToApp(SERENITY_APP_NAME, SERENITY_TRIGGERS, locale),
    ],
    logo: SERENITY_APP_LOGO,
    logo_file_name: 'logo.svg',
    logo_mime_type: 'image/svg+xml',

    rest: {
      url: 'https://api.serenitystar.ai',
      data: 'json',
      oauth2_grant_type: 'none',
      token_type: 'X-API-KEY',
      ping_method: 'GET',
      ping_path: '/api/v2/Account',
    },
    rest_modifiers: {
      options: SERENITY_CONN_OPTIONS,
      required_options: 'apiKey',
      set_options_post_auth: (context) => {
        const apiKey = context.conn_opts?.apiKey;

        if (!apiKey) {
          throw new Error('API Key is required');
        }

        return {
          apiKey,
          token: apiKey,
        };
      },
    },
  }) satisfies TQoreAppWithActions;
