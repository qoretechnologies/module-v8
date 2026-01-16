import { TQoreAppWithActions, TQoreRecordBasedApp } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers/index';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { SEATABLE_APP_LOGO, SEATABLE_APP_NAME, SEATABLE_CONN_OPTIONS } from './constants';

import * as SEATABLE_ACTIONS from './actions';
import * as SEATABLE_TRIGGERS from './triggers';
import { createSeaTableRecords } from './helpers/record-based/create-records';
import { deleteSeaTableRecords } from './helpers/record-based/delete-records';
import { getSeaTableExpressions } from './helpers/record-based/get-expressions';
import { getSeaTableRecordType } from './helpers/record-based/get-record-type';
import { SeaTableSearchOptions } from './helpers/record-based/get-search-options';
import { getSeaTableTableList } from './helpers/record-based/get-table-list';
import { searchSeaTableRecords } from './helpers/record-based/search-records';
import { updateSeaTableRecords } from './helpers/record-based/update-records';

export default (locale: Locales) =>
  ({
    name: SEATABLE_APP_NAME,
    display_name: L[locale].apps[SEATABLE_APP_NAME].displayName(),
    short_desc: L[locale].apps[SEATABLE_APP_NAME].shortDesc(),
    desc: L[locale].apps[SEATABLE_APP_NAME].longDesc(),
    actions: [
      ...mapActionsToApp(SEATABLE_APP_NAME, SEATABLE_ACTIONS, locale),
      ...mapTriggersToApp(SEATABLE_APP_NAME, SEATABLE_TRIGGERS, locale),
    ],
    logo: SEATABLE_APP_LOGO,
    logo_file_name: 'seatable-logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://cloud.seatable.io',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/api/v2.1/dtable/app-access-token/',
      token_type: 'Bearer',
    },
    rest_modifiers: {
      options: SEATABLE_CONN_OPTIONS,
      required_options: 'url,api_token',
    },
    get_table_list: getSeaTableTableList,
    expressions: getSeaTableExpressions(locale),
    get_record_type: getSeaTableRecordType,
    search_records: searchSeaTableRecords,
    search_options: SeaTableSearchOptions,
    create_records: createSeaTableRecords,
    update_records: updateSeaTableRecords,
    delete_records: deleteSeaTableRecords,
  }) satisfies TQoreRecordBasedApp & TQoreAppWithActions;
