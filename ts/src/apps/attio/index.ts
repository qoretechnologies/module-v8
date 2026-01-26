import { TQoreAppWithActions, TQoreRecordBasedApp } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import * as ATTIO_ACTIONS from './actions';
import { ATTIO_APP_API_URL, ATTIO_APP_LOGO, ATTIO_APP_NAME } from './constants';
import { createAttioRecords } from './helpers/record-based/create-records';
import { deleteAttioRecords } from './helpers/record-based/delete-records';
import { getAttioExpressions } from './helpers/record-based/get-expressions';
import { getAttioRecordType } from './helpers/record-based/get-record-type';
import { getAttioTableList } from './helpers/record-based/get-table-list';
import { AttioSearchOptions, AttioUpsertOptions } from './helpers/record-based/options';
import { searchAttioRecords } from './helpers/record-based/search-records';
import { updateAttioRecords } from './helpers/record-based/update-records';
import { upsertAttioRecords } from './helpers/record-based/upsert-records';
import * as ATTIO_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: ATTIO_APP_NAME,
    display_name: L[locale].apps[ATTIO_APP_NAME].displayName(),
    short_desc: L[locale].apps[ATTIO_APP_NAME].shortDesc(),
    desc: L[locale].apps[ATTIO_APP_NAME].longDesc(),
    logo: ATTIO_APP_LOGO,
    logo_file_name: 'attio-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(ATTIO_APP_NAME, ATTIO_ACTIONS, locale),
      ...mapTriggersToApp(ATTIO_APP_NAME, ATTIO_TRIGGERS, locale),
    ],
    rest: {
      url: ATTIO_APP_API_URL,
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://app.attio.com/authorize',
      oauth2_token_url: 'https://app.attio.com/oauth/token',
      ping_method: 'GET',
      ping_path: '/v2/self',
    },
    get_table_list: getAttioTableList,
    expressions: getAttioExpressions(locale),
    get_record_type: getAttioRecordType,
    search_records: searchAttioRecords,
    create_records: createAttioRecords,
    update_records: updateAttioRecords,
    delete_records: deleteAttioRecords,
    upsert_records: upsertAttioRecords,
    search_options: AttioSearchOptions,
    upsert_options: AttioUpsertOptions,
  }) satisfies TQoreAppWithActions & TQoreRecordBasedApp;
