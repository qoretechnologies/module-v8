import {
  IQoreRestConnectionModifiers,
  TQoreAppWithActions,
  TQoreRecordBasedApp,
} from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import {
  TRELLO_ACTIONS,
  TRELLO_APP_LOGO,
  TRELLO_APP_NAME,
  TRELLO_CONN_OPTIONS,
} from './constants';
import * as TRELLO_TRIGGERS from './triggers';

// Record-based helpers
import { createTrelloRecords } from './helpers/record-based/create-records';
import { deleteTrelloRecords } from './helpers/record-based/delete-records';
import { getTrelloExpressions } from './helpers/record-based/get-expressions';
import { getTrelloRecordType } from './helpers/record-based/get-record-type';
import { TrelloSearchOptions } from './helpers/record-based/get-search-options';
import { getTrelloTableList } from './helpers/record-based/get-table-list';
import { searchTrelloRecords } from './helpers/record-based/search-records';
import { updateTrelloRecords } from './helpers/record-based/update-records';

const setOptionsPostAuth: IQoreRestConnectionModifiers['set_options_post_auth'] = (context) => {
  const token = context?.conn_opts?.token;
  const key = context?.conn_opts?.key || context?.conn_opts?.oauth2_client_id;
  const redirect_url = context?.conn_opts?.oauth2_redirect_url;
  const headers = {
    Authorization: `OAuth oauth_consumer_key="${key}", oauth_token="${token}"`,
  };

  return {
    key,
    oauth2_auth_args: {
      key,
      return_url: redirect_url,
    },
    headers,
    ping_headers: headers,
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
      oauth2_grant_type: 'implicit',
      oauth2_auth_url: 'https://trello.com/1/OAuthAuthorizeToken',
      // Trello doesn't pass through the state parameter, so embed it in redirect_uri
      oauth2_redirect_passthrough_state: false,
      oauth2_auth_args: {
        expiration: 'never',
        callback_method: 'fragment',
        scope: 'read,write',
        // Use template variable - will be substituted with oauth2_client_id value from cloud
        key: '{{oauth2_client_id}}',
      },
      // oauth2_client_id not set here - comes from cloud configuration (like Slack)
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

    // Record-based helpers
    get_table_list: getTrelloTableList,
    expressions: getTrelloExpressions(locale),
    get_record_type: getTrelloRecordType,
    search_records: searchTrelloRecords,
    search_options: TrelloSearchOptions,
    create_records: createTrelloRecords,
    update_records: updateTrelloRecords,
    delete_records: deleteTrelloRecords,
  }) satisfies TQoreRecordBasedApp & TQoreAppWithActions;
