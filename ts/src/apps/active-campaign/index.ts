import {
  TQoreAppWithActions,
  TQoreRecordBasedApp,
} from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import {
  ACTIVE_CAMPAIGN_APP_LOGO,
  ACTIVE_CAMPAIGN_APP_NAME,
  ACTIVE_CAMPAIGN_CONN_OPTIONS,
} from './constants';

import * as ACTIVE_CAMPAIGN_ACTIONS from './actions';
import * as ACTIVE_CAMPAIGN_TRIGGERS from './triggers';

// Record-based helpers
import { createActiveCampaignRecords } from './helpers/record-based/create-records';
import { deleteActiveCampaignRecords } from './helpers/record-based/delete-records';
import { getActiveCampaignExpressions } from './helpers/record-based/get-expressions';
import { getActiveCampaignRecordType } from './helpers/record-based/get-record-type';
import { ActiveCampaignSearchOptions } from './helpers/record-based/get-search-options';
import { getActiveCampaignTableList } from './helpers/record-based/get-table-list';
import { searchActiveCampaignRecords } from './helpers/record-based/search-records';
import { updateActiveCampaignRecords } from './helpers/record-based/update-records';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[ACTIVE_CAMPAIGN_APP_NAME].displayName(),
    short_desc: L[locale].apps[ACTIVE_CAMPAIGN_APP_NAME].shortDesc(),
    desc: L[locale].apps[ACTIVE_CAMPAIGN_APP_NAME].longDesc(),
    name: ACTIVE_CAMPAIGN_APP_NAME,
    actions: [
      ...mapActionsToApp(ACTIVE_CAMPAIGN_APP_NAME, ACTIVE_CAMPAIGN_ACTIONS, locale),
      ...mapTriggersToApp(ACTIVE_CAMPAIGN_APP_NAME, ACTIVE_CAMPAIGN_TRIGGERS, locale),
    ],
    logo: ACTIVE_CAMPAIGN_APP_LOGO,
    logo_file_name: 'logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'auto',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/api/3/users/me',
      token_api_key_header: 'Api-Token',
    },
    rest_modifiers: {
      options: ACTIVE_CAMPAIGN_CONN_OPTIONS,
      required_options: 'instance_url,token',
      set_options_post_auth: (context) => {
        const instance_url = context.conn_opts?.instance_url;

        return {
          baseUrl: instance_url,
        };
      },
      url_from_option: 'instance_url',
    },

    // Record-based helpers
    get_table_list: getActiveCampaignTableList,
    expressions: getActiveCampaignExpressions(locale),
    get_record_type: getActiveCampaignRecordType,
    search_records: searchActiveCampaignRecords,
    search_options: ActiveCampaignSearchOptions,
    create_records: createActiveCampaignRecords,
    update_records: updateActiveCampaignRecords,
    delete_records: deleteActiveCampaignRecords,
  }) satisfies TQoreRecordBasedApp & TQoreAppWithActions;
