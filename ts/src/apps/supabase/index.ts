import { TQoreAppWithActions, TQoreRecordBasedApp } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers/index';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { SUPABASE_APP_LOGO, SUPABASE_APP_NAME, SUPABASE_CONN_OPTIONS } from './constants';
import { getSupabaseExpressionsFunction } from './helpers/record-based/get-expression';
import { getSupabaseRecordType } from './helpers/record-based/get-record-type';
import { getSupabaseTableList } from './helpers/record-based/get-table-list';
import { searchSupabaseRecords } from './helpers/record-based/search-records';

import * as SUPABASE_TRIGGERS from './triggers';
import * as SUPABASE_ACTIONS from './actions';
import { createSupabaseRecord } from './helpers/record-based/create-records';
import { upsertSupabaseRecord } from './helpers/record-based/upsert-records';
import { updateSupabaseRecords } from './helpers/record-based/update-records';
import { deleteSupabaseRecords } from './helpers/record-based/delete-records';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[SUPABASE_APP_NAME].displayName(),
    short_desc: L[locale].apps[SUPABASE_APP_NAME].shortDesc(),
    desc: L[locale].apps[SUPABASE_APP_NAME].longDesc(),
    name: SUPABASE_APP_NAME,
    actions: [
      ...mapActionsToApp(SUPABASE_APP_NAME, SUPABASE_ACTIONS, locale),
      ...mapTriggersToApp(SUPABASE_APP_NAME, SUPABASE_TRIGGERS, locale),
    ],
    logo: SUPABASE_APP_LOGO,
    logo_file_name: 'supabase-logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://{{projectId}}.supabase.co',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/rest/v1/',
      token_api_key_header: 'apikey',
    },
    rest_modifiers: {
      options: SUPABASE_CONN_OPTIONS,
      required_options: 'projectId,token',
      url_template_options: ['projectId'],
    },
    get_table_list: getSupabaseTableList,
    get_expressions: getSupabaseExpressionsFunction(locale),
    get_record_type: getSupabaseRecordType,
    search_records: searchSupabaseRecords,
    create_record: createSupabaseRecord,
    upsert_record: upsertSupabaseRecord,
    update_records: updateSupabaseRecords,
    delete_records: deleteSupabaseRecords,
  }) satisfies TQoreRecordBasedApp & TQoreAppWithActions;
