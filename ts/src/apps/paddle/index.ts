import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import * as PADDLE_ACTIONS from './actions';
import { PADDLE_APP_LOGO, PADDLE_APP_NAME, PADDLE_CONN_OPTIONS } from './constants';
import * as PADDLE_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[PADDLE_APP_NAME].displayName(),
    short_desc: L[locale].apps[PADDLE_APP_NAME].shortDesc(),
    desc: L[locale].apps[PADDLE_APP_NAME].longDesc(),
    name: PADDLE_APP_NAME,
    actions: [
      ...mapActionsToApp(PADDLE_APP_NAME, PADDLE_ACTIONS, locale),
      ...mapTriggersToApp(PADDLE_APP_NAME, PADDLE_TRIGGERS, locale),
    ],
    logo: PADDLE_APP_LOGO,
    logo_file_name: 'paddle-logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://{{instance_type}}.paddle.com',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/event-types',
    },
    rest_modifiers: {
      options: PADDLE_CONN_OPTIONS,
      required_options: 'instance_type,token',
      url_template_options: ['instance_type'],
    },
  }) satisfies TQoreAppWithActions;
