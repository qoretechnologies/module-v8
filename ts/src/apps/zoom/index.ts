import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { actionsCatalogue } from '../../ActionsCatalogue';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { ZOOM_MEETINGS_ACTIONS } from './allowed-paths/meetings';
import { ZOOM_APP_LOGO, ZOOM_APP_NAME } from './constants';
import * as ZOOM_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: ZOOM_APP_NAME,
    display_name: L[locale].apps[ZOOM_APP_NAME].displayName(),
    short_desc: L[locale].apps[ZOOM_APP_NAME].shortDesc(),
    desc: L[locale].apps[ZOOM_APP_NAME].longDesc(),
    logo: ZOOM_APP_LOGO,
    logo_file_name: 'zoom-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(ZOOM_APP_NAME, ZOOM_MEETINGS_ACTIONS, locale),
      ...mapTriggersToApp(ZOOM_APP_NAME, ZOOM_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api.zoom.us/v2',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_client_secret: actionsCatalogue.getOauth2ClientSecret(ZOOM_APP_NAME),
      oauth2_auth_url: 'https://zoom.us/oauth/authorize',
      oauth2_token_url: 'https://zoom.us/oauth/token',
      oauth2_scopes: [],
      ping_method: 'GET',
      ping_path: 'users/me',
    },
    swagger_options: {
      parse_flags: -1,
    },
    swagger_schema_map: {
      meetings: {
        swagger: 'schemas/zoom/meetings.swagger.json',
      },
    },
  }) satisfies TQoreAppWithActions;
