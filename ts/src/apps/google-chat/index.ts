import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { GOOGLE_CHAT_APP_LOGO, GOOGLE_CHAT_APP_NAME } from './constants';

export default (locale: Locales) =>
  ({
    name: GOOGLE_CHAT_APP_NAME,
    display_name: L[locale].apps[GOOGLE_CHAT_APP_NAME].displayName(),
    short_desc: L[locale].apps[GOOGLE_CHAT_APP_NAME].shortDesc(),
    desc: L[locale].apps[GOOGLE_CHAT_APP_NAME].longDesc(),
    logo: GOOGLE_CHAT_APP_LOGO,
    logo_file_name: 'google-chat-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [],
    rest: {
      url: 'https://chat.googleapis.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://accounts.google.com/o/oauth2/v2/auth',
      oauth2_token_url: 'https://oauth2.googleapis.com/token',
      oauth2_scopes: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/chat.spaces.readonly',
        'https://www.googleapis.com/auth/chat.memberships.readonly',
        'https://www.googleapis.com/auth/chat.messages',
      ],
      oauth2_auth_args: {
        access_type: 'offline',
        prompt: 'consent',
      },
      ping_method: 'GET',
      ping_path: '/v1/spaces',
    },
  }) satisfies TQoreAppWithActions;
