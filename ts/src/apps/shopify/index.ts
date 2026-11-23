import { TQoreAppWithActions, TQoreRecordBasedApp } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { SHOPIFY_APP_LOGO, SHOPIFY_APP_NAME } from './constants';
import { getShopifyRestModifiers, getShopifyRestOptions } from './rest';

import * as SHOPIFY_ACTIONS from './actions';
import * as SHOPIFY_TRIGGERS from './triggers';

// Record-based helpers
import { createShopifyRecords } from './helpers/record-based/create-records';
import { deleteShopifyRecords } from './helpers/record-based/delete-records';
import { getShopifyExpressions } from './helpers/record-based/get-expressions';
import { getShopifyRecordType } from './helpers/record-based/get-record-type';
import { ShopifySearchOptions } from './helpers/record-based/get-search-options';
import { getShopifyTableList } from './helpers/record-based/get-table-list';
import { searchShopifyRecords } from './helpers/record-based/search-records';
import { updateShopifyRecords } from './helpers/record-based/update-records';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[SHOPIFY_APP_NAME].displayName(),
    short_desc: L[locale].apps[SHOPIFY_APP_NAME].shortDesc(),
    desc: L[locale].apps[SHOPIFY_APP_NAME].longDesc(),
    name: SHOPIFY_APP_NAME,
    actions: [
      ...mapActionsToApp(SHOPIFY_APP_NAME, SHOPIFY_ACTIONS, locale),
      ...mapTriggersToApp(SHOPIFY_APP_NAME, SHOPIFY_TRIGGERS, locale),
    ],
    logo: SHOPIFY_APP_LOGO,
    logo_file_name: 'logo.svg',
    logo_mime_type: 'image/svg+xml',

    rest: getShopifyRestOptions(),
    rest_modifiers: getShopifyRestModifiers(),

    // Record-based helpers
    get_table_list: getShopifyTableList,
    expressions: getShopifyExpressions(locale),
    get_record_type: getShopifyRecordType,
    search_records: searchShopifyRecords,
    search_options: ShopifySearchOptions,
    create_records: createShopifyRecords,
    update_records: updateShopifyRecords,
    delete_records: deleteShopifyRecords,
  }) satisfies TQoreRecordBasedApp & TQoreAppWithActions;
