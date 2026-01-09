import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import * as OPEN_WEATHER_MAP_ACTIONS from './actions';
import {
  OPEN_WEATHER_MAP_API_URL,
  OPEN_WEATHER_MAP_APP_NAME,
  OPEN_WEATHER_MAP_CONN_OPTIONS,
  OPEN_WEATHER_MAP_LOGO,
} from './constants';
import * as OPEN_WEATHER_MAP_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[OPEN_WEATHER_MAP_APP_NAME].displayName(),
    short_desc: L[locale].apps[OPEN_WEATHER_MAP_APP_NAME].shortDesc(),
    desc: L[locale].apps[OPEN_WEATHER_MAP_APP_NAME].longDesc(),
    name: OPEN_WEATHER_MAP_APP_NAME,
    actions: [
      ...mapActionsToApp(OPEN_WEATHER_MAP_APP_NAME, OPEN_WEATHER_MAP_ACTIONS, locale),
      ...mapTriggersToApp(OPEN_WEATHER_MAP_APP_NAME, OPEN_WEATHER_MAP_TRIGGERS, locale),
    ],
    logo: OPEN_WEATHER_MAP_LOGO,
    logo_file_name: 'logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: OPEN_WEATHER_MAP_API_URL,
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/data/2.5/weather?q=London&appid={token}',
    },
    rest_modifiers: {
      options: OPEN_WEATHER_MAP_CONN_OPTIONS,
      required_options: 'token',
    },
  }) satisfies TQoreAppWithActions;
