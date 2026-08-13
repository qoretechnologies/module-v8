import { TQoreAppWithActions, TQoreRecordBasedApp } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { NOTION_APP_LOGO, NOTION_APP_NAME } from './constants';
import { NOTION_API_VERSION } from './helpers/constants';
import { createNotionRecords } from './helpers/record-based/create-records';
import { deleteNotionRecords } from './helpers/record-based/delete-records';
import { getNotionExpressions } from './helpers/record-based/get-expressions';
import { getNotionRecordType } from './helpers/record-based/get-record-type';
import { getNotionTableList } from './helpers/record-based/get-table-list';
import { searchNotionRecords } from './helpers/record-based/search-records';
import { updateNotionRecords } from './helpers/record-based/update-records';

import * as NOTION_ACTIONS from './actions';
import { NotionSearchOptions } from './helpers/record-based/get-search-options';
import * as NOTION_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: NOTION_APP_NAME,
    display_name: L[locale].apps[NOTION_APP_NAME].displayName(),
    short_desc: L[locale].apps[NOTION_APP_NAME].shortDesc(),
    desc: L[locale].apps[NOTION_APP_NAME].longDesc(),
    logo: NOTION_APP_LOGO,
    logo_file_name: 'notion-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(NOTION_APP_NAME, NOTION_ACTIONS, locale),
      ...mapTriggersToApp(NOTION_APP_NAME, NOTION_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api.notion.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://api.notion.com/v1/oauth/authorize',
      oauth2_token_url: 'https://api.notion.com/v1/oauth/token',
      oauth2_scopes: ['read', 'write'],
      oauth2_token_use_basic_auth: true,
      oauth2_auth_args: {
        owner: 'user',
      },
      ping_method: 'GET',
      ping_path: '/v1/users/me',
      ping_headers: {
        // the ping must announce the same version the client sends; hardcoding it left the
        // connection test on a 2022 version while every action used the pinned one
        'Notion-Version': NOTION_API_VERSION,
      },
    },
    expressions: getNotionExpressions(locale),
    get_record_type: getNotionRecordType,
    get_table_list: getNotionTableList,
    search_options: NotionSearchOptions,
    create_records: createNotionRecords,
    update_records: updateNotionRecords,
    delete_records: deleteNotionRecords,
    search_records: searchNotionRecords,
  }) satisfies TQoreAppWithActions & TQoreRecordBasedApp;
