import { TQoreAppWithActions, TQoreRecordBasedApp } from '@qoretechnologies/ts-toolkit';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { MONDAY_APP_LOGO, MONDAY_APP_NAME } from './constants';

import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import * as MONDAY_ACTIONS from './actions';
import { createMondayRecords } from './helpers/record-based/create-records';
import { getMondayExpressions } from './helpers/record-based/get-expressions';
import { getMondayRecordType } from './helpers/record-based/get-record-type';
import { getMondayTableList } from './helpers/record-based/get-table-list';
import { MondayCreateOptions, MondaySearchOptions } from './helpers/record-based/options';
import { searchMondayRecords } from './helpers/record-based/search-records';
import { updateMondayRecords } from './helpers/record-based/update-records';
import * as MONDAY_TRIGGERS from './triggers';
import { deleteMondayRecords } from './helpers/record-based/delete-records';

export default (locale: Locales) =>
  ({
    name: MONDAY_APP_NAME,
    display_name: L[locale].apps[MONDAY_APP_NAME].displayName(),
    short_desc: L[locale].apps[MONDAY_APP_NAME].shortDesc(),
    desc: L[locale].apps[MONDAY_APP_NAME].longDesc(),
    actions: [
      ...mapActionsToApp(MONDAY_APP_NAME, MONDAY_ACTIONS, locale),
      ...mapTriggersToApp(MONDAY_APP_NAME, MONDAY_TRIGGERS, locale),
    ],
    logo: MONDAY_APP_LOGO,
    logo_file_name: 'monday.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      data: 'json',
      url: 'https://api.monday.com',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://auth.monday.com/oauth2/authorize',
      oauth2_token_url: 'https://auth.monday.com/oauth2/token',
      ping_method: 'POST',
      ping_path: 'v2',
      ping_body: { query: 'query{me{id}}' },
      oauth2_scopes: [
        'me:read',
        'boards:read',
        'boards:write',
        'docs:read',
        'docs:write',
        'workspaces:read',
        'workspaces:write',
        'users:read',
        'users:write',
        'account:read',
        'notifications:write',
        'updates:read',
        'updates:write',
        'assets:read',
        'tags:read',
        'teams:read',
        'webhooks:write',
        'webhooks:read',
      ],
    },
    get_table_list: getMondayTableList,
    get_record_type: getMondayRecordType,
    expressions: getMondayExpressions(locale),
    search_options: MondaySearchOptions,
    create_options: MondayCreateOptions,
    search_records: searchMondayRecords,
    create_records: createMondayRecords,
    update_records: updateMondayRecords,
    delete_records: deleteMondayRecords,
  }) satisfies TQoreAppWithActions & TQoreRecordBasedApp;
