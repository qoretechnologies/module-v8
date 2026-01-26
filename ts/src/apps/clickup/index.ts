import { TQoreAppWithActions, TQoreRecordBasedApp } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { CLICKUP_APP_LOGO, CLICKUP_APP_NAME } from './constants';

import * as CLICKUP_ACTIONS from './actions';
import * as CLICKUP_TRIGGERS from './triggers';

// Record-based helpers
import { createClickUpRecords } from './helpers/record-based/create-records';
import { deleteClickUpRecords } from './helpers/record-based/delete-records';
import { getClickUpExpressions } from './helpers/record-based/get-expressions';
import { getClickUpRecordType } from './helpers/record-based/get-record-type';
import { ClickUpSearchOptions } from './helpers/record-based/get-search-options';
import { getClickUpTableList } from './helpers/record-based/get-table-list';
import { searchClickUpRecords } from './helpers/record-based/search-records';
import { updateClickUpRecords } from './helpers/record-based/update-records';

export default (locale: Locales) =>
  ({
    name: CLICKUP_APP_NAME,
    display_name: L[locale].apps[CLICKUP_APP_NAME].displayName(),
    short_desc: L[locale].apps[CLICKUP_APP_NAME].shortDesc(),
    desc: L[locale].apps[CLICKUP_APP_NAME].longDesc(),
    logo: CLICKUP_APP_LOGO,
    logo_file_name: 'clickup-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(CLICKUP_APP_NAME, CLICKUP_ACTIONS, locale),
      ...mapTriggersToApp(CLICKUP_APP_NAME, CLICKUP_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api.clickup.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://app.clickup.com/api',
      oauth2_token_url: 'https://api.clickup.com/api/v2/oauth/token',
      ping_method: 'GET',
      ping_path: '/api/v2/user',
    },
    // Record-based helpers
    get_table_list: getClickUpTableList,
    expressions: getClickUpExpressions(locale),
    get_record_type: getClickUpRecordType,
    search_records: searchClickUpRecords,
    search_options: ClickUpSearchOptions,
    create_records: createClickUpRecords,
    update_records: updateClickUpRecords,
    delete_records: deleteClickUpRecords,
  }) satisfies TQoreRecordBasedApp & TQoreAppWithActions;
