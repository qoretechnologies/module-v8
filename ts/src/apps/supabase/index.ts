import {
  QorusRequest,
  TQoreAppWithActions,
  TQoreRecordBasedApp,
} from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapActionsToApp,
  mapTriggersToApp,
} from '../../global/helpers/index';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { SUPABASE_APP_LOGO, SUPABASE_APP_NAME, SUPABASE_CONN_OPTIONS } from './constants';
import { getSupabaseExpressions } from './helpers/record-based/get-expression';
import { getSupabaseRecordType } from './helpers/record-based/get-record-type';
import { getSupabaseTableList } from './helpers/record-based/get-table-list';
import { searchSupabaseRecords } from './helpers/record-based/search-records';

import * as SUPABASE_ACTIONS from './actions';
import { createSupabaseRecords } from './helpers/record-based/create-records';
import { deleteSupabaseRecords } from './helpers/record-based/delete-records';
import { SupabaseSearchOptions } from './helpers/record-based/get-search-options';
import { updateSupabaseRecords } from './helpers/record-based/update-records';
import { upsertSupabaseRecord } from './helpers/record-based/upsert-records';
import * as SUPABASE_TRIGGERS from './triggers';

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
      set_options_post_auth: async (context) => {
        const { token, projectId } = getQoreContextRequiredValues({
          context,
          connectionFields: ['projectId', 'token'],
        });

        const response = await QorusRequest.get<{ data: { paths: Record<string, any> } }>(
          {
            path: '/rest/v1/',
            headers: {
              apiKey: token,
            },
          },
          {
            url: `https://${projectId}.supabase.co`,
            endpointId: SUPABASE_APP_NAME,
          }
        );

        const data = response?.data;

        if (!data) return;

        const paths = Object.keys(response.data.paths || {}).filter((path) => path !== '/');

        if (paths.length === 0) return;

        return {
          ping_path: `/rest/v1${paths[0]}`,
        };
      },
    },
    get_table_list: getSupabaseTableList,
    expressions: getSupabaseExpressions(locale),
    get_record_type: getSupabaseRecordType,
    search_records: searchSupabaseRecords,
    create_records: createSupabaseRecords,
    upsert_records: upsertSupabaseRecord,
    update_records: updateSupabaseRecords,
    delete_records: deleteSupabaseRecords,
    search_options: SupabaseSearchOptions,
  }) satisfies TQoreRecordBasedApp & TQoreAppWithActions;
