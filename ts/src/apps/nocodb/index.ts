import { TQoreAppWithActions, TQoreRecordBasedApp } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers/index';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { NOCODB_APP_LOGO, NOCODB_APP_NAME, NOCODB_CONN_OPTIONS } from './constants';

import * as NOCODB_ACTIONS from './actions';
import * as NOCODB_TRIGGERS from './triggers';
import { createNocoDBRecords } from './helpers/record-based/create-records';
import { deleteNocoDBRecords } from './helpers/record-based/delete-records';
import { getNocoDBExpressions } from './helpers/record-based/get-expressions';
import { getNocoDBRecordType } from './helpers/record-based/get-record-type';
import { NocoDBSearchOptions } from './helpers/record-based/get-search-options';
import { getNocoDBTableList } from './helpers/record-based/get-table-list';
import { searchNocoDBRecords } from './helpers/record-based/search-records';
import { updateNocoDBRecords } from './helpers/record-based/update-records';

export default (locale: Locales) =>
  ({
    name: NOCODB_APP_NAME,
    display_name: L[locale].apps[NOCODB_APP_NAME].displayName(),
    short_desc: L[locale].apps[NOCODB_APP_NAME].shortDesc(),
    desc: L[locale].apps[NOCODB_APP_NAME].longDesc(),
    actions: [
      ...mapActionsToApp(NOCODB_APP_NAME, NOCODB_ACTIONS, locale),
      ...mapTriggersToApp(NOCODB_APP_NAME, NOCODB_TRIGGERS, locale),
    ],
    logo: NOCODB_APP_LOGO,
    logo_file_name: 'nocodb-logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://app.nocodb.com',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/api/v3/meta/workspaces',
      token_type: 'xc-token',
    },
    rest_modifiers: {
      options: NOCODB_CONN_OPTIONS,
      required_options: 'url,token',
    },
    get_table_list: getNocoDBTableList,
    expressions: getNocoDBExpressions(locale),
    get_record_type: getNocoDBRecordType,
    search_records: searchNocoDBRecords,
    search_options: NocoDBSearchOptions,
    create_records: createNocoDBRecords,
    update_records: updateNocoDBRecords,
    delete_records: deleteNocoDBRecords,
  }) satisfies TQoreRecordBasedApp & TQoreAppWithActions;
