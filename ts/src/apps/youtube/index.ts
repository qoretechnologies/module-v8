import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { YOUTUBE_APP_LOGO, YOUTUBE_APP_NAME } from './constants';

import * as YOUTUBE_ACTIONS from './actions';
import * as YOUTUBE_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: YOUTUBE_APP_NAME,
    display_name: L[locale].apps[YOUTUBE_APP_NAME].displayName(),
    short_desc: L[locale].apps[YOUTUBE_APP_NAME].shortDesc(),
    desc: L[locale].apps[YOUTUBE_APP_NAME].longDesc(),
    logo: YOUTUBE_APP_LOGO,
    logo_file_name: 'youtube-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(YOUTUBE_APP_NAME, YOUTUBE_ACTIONS, locale),
      ...mapTriggersToApp(YOUTUBE_APP_NAME, YOUTUBE_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://www.googleapis.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://accounts.google.com/o/oauth2/v2/auth',
      oauth2_token_url: 'https://oauth2.googleapis.com/token',
      oauth2_scopes: [
        'https://www.googleapis.com/auth/youtube.force-ssl',
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/yt-analytics.readonly',
        'https://www.googleapis.com/auth/youtube',
      ],
      oauth2_auth_args: {
        access_type: 'offline',
        prompt: 'consent',
      },
      ping_method: 'GET',
      ping_path: '/youtube/v3/channels?part=id&mine=true',
    },
  }) satisfies TQoreAppWithActions;
