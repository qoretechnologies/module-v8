import { TCustomConnOptions, TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { SLACK_API_URL, SLACK_APP_LOGO, SLACK_APP_NAME } from './constants';

import * as SLACK_ACTIONS from './actions';
import * as SLACK_TRIGGERS from './triggers';

/**
 * Connection options for Slack
 * Includes authed_user for storing user token from OAuth response
 */
const SLACK_CONN_OPTIONS = {
  authed_user: {
    type: 'hash',
    short_desc: 'Authenticated user information including user token',
  },
} satisfies TCustomConnOptions;

/**
 * Post-auth handler to extract and store authed_user from OAuth response
 */
const setSlackOptionsPostAuth = (
  context: Record<string, any>
): Record<string, any> => {
  if (!context?.conn_opts?.authed_user) {
    return { authed_user: {} };
  }

  return {
    authed_user: context.conn_opts.authed_user,
  };
};

export default (locale: Locales) =>
  ({
    name: SLACK_APP_NAME,
    display_name: L[locale].apps[SLACK_APP_NAME].displayName(),
    short_desc: L[locale].apps[SLACK_APP_NAME].shortDesc(),
    desc: L[locale].apps[SLACK_APP_NAME].longDesc(),
    logo: SLACK_APP_LOGO,
    logo_file_name: 'slack-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(SLACK_APP_NAME, SLACK_ACTIONS, locale),
      ...mapTriggersToApp(SLACK_APP_NAME, SLACK_TRIGGERS, locale),
    ],
    rest: {
      url: SLACK_API_URL,
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://slack.com/oauth/v2/authorize',
      oauth2_token_url: 'https://slack.com/api/oauth.v2.access',
      ping_method: 'POST',
      ping_path: 'auth.test',
      oauth2_scopes: [
        'channels:read',
        'channels:manage',
        'channels:history',
        'channels:join',
        'chat:write',
        'chat:write.public',
        'groups:read',
        'groups:write',
        'reactions:read',
        'reactions:write',
        'mpim:read',
        'mpim:write',
        'im:write',
        'users:read',
        'users:read.email',
        'files:write',
        'files:read',
        'pins:read',
        'pins:write',
      ],
      oauth2_auth_args: {
        user_scope: [
          'channels:history',
          'channels:read',
          'channels:write',
          'chat:write',
          'groups:history',
          'im:history',
          'users:read',
          'users:read.email',
          'users.profile:read',
          'users.profile:write',
          'reactions:read',
          'search:read',
        ],
      },
    },
    rest_modifiers: {
      options: SLACK_CONN_OPTIONS,
      set_options_post_auth: setSlackOptionsPostAuth,
      set_options_post_auth_code: setSlackOptionsPostAuth,
    },
  }) satisfies TQoreAppWithActions;
