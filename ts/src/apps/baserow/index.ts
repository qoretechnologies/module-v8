import {
  TQoreAppWithActions,
  TQoreRecordBasedApp,
} from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers/index';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { BASEROW_APP_LOGO, BASEROW_APP_NAME, BASEROW_CONN_OPTIONS } from './constants';

import * as BASEROW_ACTIONS from './actions';
import * as BASEROW_TRIGGERS from './triggers';
import { createBaserowRecords } from './helpers/record-based/create-records';
import { deleteBaserowRecords } from './helpers/record-based/delete-records';
import { getBaserowExpressions } from './helpers/record-based/get-expressions';
import { getBaserowRecordType } from './helpers/record-based/get-record-type';
import { BaserowSearchOptions } from './helpers/record-based/get-search-options';
import { getBaserowTableList } from './helpers/record-based/get-table-list';
import { searchBaserowRecords } from './helpers/record-based/search-records';
import { updateBaserowRecords } from './helpers/record-based/update-records';

export default (locale: Locales) =>
  ({
    name: BASEROW_APP_NAME,
    display_name: L[locale].apps[BASEROW_APP_NAME].displayName(),
    short_desc: L[locale].apps[BASEROW_APP_NAME].shortDesc(),
    desc: L[locale].apps[BASEROW_APP_NAME].longDesc(),
    actions: [
      ...mapActionsToApp(BASEROW_APP_NAME, BASEROW_ACTIONS, locale),
      ...mapTriggersToApp(BASEROW_APP_NAME, BASEROW_TRIGGERS, locale),
    ],
    logo: BASEROW_APP_LOGO,
    logo_file_name: 'baserow-logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://api.baserow.io',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/api/database/tables/all-tables',
      token_type: 'Token',
    },
    rest_modifiers: {
      options: BASEROW_CONN_OPTIONS,
      required_options: 'url,token',
    },
    get_table_list: getBaserowTableList,
    expressions: getBaserowExpressions(locale),
    get_record_type: getBaserowRecordType,
    search_records: searchBaserowRecords,
    create_records: createBaserowRecords,
    update_records: updateBaserowRecords,
    delete_records: deleteBaserowRecords,
    search_options: BaserowSearchOptions,
  }) satisfies TQoreRecordBasedApp & TQoreAppWithActions;
