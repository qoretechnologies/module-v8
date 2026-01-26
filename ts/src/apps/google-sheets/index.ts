import { TQoreAppWithActions, TQoreRecordBasedApp } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import * as GOOGLE_SHEETS_ACTIONS from './actions';
import { GOOGLE_SHEETS_APP_LOGO, GOOGLE_SHEETS_APP_NAME } from './constants';
import { createGoogleSheetsRecords } from './helpers/record-based/create-records';
import { deleteGoogleSheetsRecords } from './helpers/record-based/delete-records';
import { getGoogleSheetsExpressions } from './helpers/record-based/get-expressions';
import { getGoogleSheetsRecordType } from './helpers/record-based/get-record-type';
import { getGoogleSheetsTableList } from './helpers/record-based/get-table-list';
import { GoogleSheetsSearchOptions } from './helpers/record-based/options';
import { searchGoogleSheetsRecords } from './helpers/record-based/search-records';
import { updateGoogleSheetsRecords } from './helpers/record-based/update-records';
import * as GOOGLE_SHEETS_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: GOOGLE_SHEETS_APP_NAME,
    display_name: L[locale].apps[GOOGLE_SHEETS_APP_NAME].displayName(),
    short_desc: L[locale].apps[GOOGLE_SHEETS_APP_NAME].shortDesc(),
    desc: L[locale].apps[GOOGLE_SHEETS_APP_NAME].longDesc(),
    logo: GOOGLE_SHEETS_APP_LOGO,
    logo_file_name: 'google-sheets-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(GOOGLE_SHEETS_APP_NAME, GOOGLE_SHEETS_ACTIONS, locale),
      ...mapTriggersToApp(GOOGLE_SHEETS_APP_NAME, GOOGLE_SHEETS_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://www.googleapis.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://accounts.google.com/o/oauth2/v2/auth',
      oauth2_token_url: 'https://oauth2.googleapis.com/token',
      oauth2_scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
        'email',
        'profile',
        'openid',
      ],
      oauth2_auth_args: {
        access_type: 'offline',
        prompt: 'consent',
      },
      ping_method: 'GET',
      ping_path: '/oauth2/v3/userinfo',
    },
    get_table_list: getGoogleSheetsTableList,
    get_record_type: getGoogleSheetsRecordType,
    search_records: searchGoogleSheetsRecords,
    create_records: createGoogleSheetsRecords,
    update_records: updateGoogleSheetsRecords,
    delete_records: deleteGoogleSheetsRecords,
    expressions: getGoogleSheetsExpressions(locale),
    create_options: GoogleSheetsSearchOptions,
    search_options: GoogleSheetsSearchOptions,
  }) satisfies TQoreAppWithActions & TQoreRecordBasedApp;
