import {
  TCustomConnOptions,
  TQoreAppActionFunctionContext,
  TQoreAppWithActions,
  TQoreMappedOptions,
} from '@qoretechnologies/ts-toolkit';
import { Locales } from '../../i18n/i18n-types';
import { TRELLO_ACTIONS, TRELLO_APP_LOGO, TRELLO_APP_NAME, TRELLO_CONN_OPTIONS } from './constants';
import L from '../../i18n/i18n-node';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import * as TRELLO_TRIGGERS from './triggers';

const setOptionsPostAuth: (
  context: Omit<TQoreAppActionFunctionContext<TCustomConnOptions>, 'opts'>
) => TQoreMappedOptions<any> = (context) => {
  const key = context?.conn_opts?.key || context?.conn_opts?.oauth2_client_id;
  const redirect_url = context?.conn_opts?.oauth2_redirect_url;

  return {
    key,
    oauth2_auth_args: {
      key,
      return_url: redirect_url,
    },
  };
};

export default (locale: Locales) =>
  ({
    name: TRELLO_APP_NAME,
    display_name: L[locale].apps[TRELLO_APP_NAME].displayName(),
    short_desc: L[locale].apps[TRELLO_APP_NAME].shortDesc(),
    desc: L[locale].apps[TRELLO_APP_NAME].longDesc(),
    logo: TRELLO_APP_LOGO,
    logo_file_name: 'trello-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(TRELLO_APP_NAME, TRELLO_ACTIONS, locale),
      ...mapTriggersToApp(TRELLO_APP_NAME, TRELLO_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api.trello.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://trello.com/1/OAuthAuthorizeToken',
      oauth2_token_url: 'https://trello.com/1/OAuthGetAccessToken',
      oauth2_auth_args: {
        expiration: 'never',
        callback_method: 'fragment',
        scope: 'read,write',
        key: 'c42891766a55f94a6e1666b540f58719',
      },
      oauth2_client_id: 'c42891766a55f94a6e1666b540f58719',
      oauth2_client_secret: 'x',
      oauth2_scopes: ['read', 'write'],
      ping_method: 'GET',
      ping_path: '/1/members/me',
      oauth2_scope_separator_char: ',',
    },
    swagger: 'schemas/trello.swagger.json',
    swagger_options: {
      parse_flags: -128,
    },

    rest_modifiers: {
      set_options_post_auth: setOptionsPostAuth,
      set_options_post_auth_code: setOptionsPostAuth,
      options: TRELLO_CONN_OPTIONS,
    },
  }) satisfies TQoreAppWithActions;
