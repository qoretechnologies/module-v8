// Copyright 2026 Qore Technologies, s.r.o.
import { TQoreAppWithActions, TQoreRecordBasedApp } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { HUBSPOT_COMPANIES_ACTIONS } from './allowed-paths/companies';
import { HUBSPOT_CONTACTS_ACTIONS } from './allowed-paths/contacts';
import { HUBSPOT_CUSTOM_OBJECTS_ACTIONS } from './allowed-paths/custom-objects';
import { HUBSPOT_DEALS_ACTIONS } from './allowed-paths/deals';
import { HUBSPOT_FORMS_ACTIONS } from './allowed-paths/forms';
import { HUBSPOT_LEADS_ACTIONS } from './allowed-paths/leads';
import { HUBSPOT_LISTS_ACTIONS } from './allowed-paths/lists';
import { HUBSPOT_PRODUCTS_ACTIONS } from './allowed-paths/products';
import { HUBSPOT_TICKETS_ACTIONS } from './allowed-paths/tickets';
import { HUBSPOT_USERS_ACTIONS } from './allowed-paths/users';
import { HUBSPOT_APP_NAME, getHubspotRestOptions } from './rest';
import * as HUBSPOT_TRIGGERS from './triggers';
import * as HUBSPOT_ACTIONS from './actions';
import { HubspotSearchOptions } from './helpers/record-based/get-search-options';
import { getHubspotExpressions } from './helpers/record-based/get-expressions';
import { getHubspotRecordType } from './helpers/record-based/get-record-type';
import { getHubspotTableList } from './helpers/record-based/get-table-list';
import { HubspotUpsertOptions } from './helpers/record-based/get-upsert-options';
import { searchHubspotRecords } from './helpers/record-based/search-records';
import { createHubspotRecords } from './helpers/record-based/create-records';
import { updateHubspotRecords } from './helpers/record-based/update-records';
import { deleteHubspotRecords } from './helpers/record-based/delete-records';
import { upsertHubspotRecords } from './helpers/record-based/upsert-records';
import { hubspotSchemaMetadata } from '../../schema-cache/hubspot';

export default (locale: Locales) =>
  ({
    name: HUBSPOT_APP_NAME,
    display_name: L[locale].apps[HUBSPOT_APP_NAME].displayName(),
    short_desc: L[locale].apps[HUBSPOT_APP_NAME].shortDesc(),
    desc: L[locale].apps[HUBSPOT_APP_NAME].longDesc(),
    logo:
      `PHN2ZyBoZWlnaHQ9IjI1MDAiIHZpZXdCb3g9IjYuMjA4NTYyODMgLjY0NDk4ODI0IDI0NC4yNjk` +
      `0MzcxNyAyNTEuMjQ3MDExNzYiIHdpZHRoPSIyNTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcm` +
      `cvMjAwMC9zdmciPjxwYXRoIGQ9Im0xOTEuMzg1IDg1LjY5NHYtMjkuNTA2YTIyLjcyMiAyMi43M` +
      `jIgMCAwIDAgMTMuMTAxLTIwLjQ4di0uNjc3YzAtMTIuNTQ5LTEwLjE3My0yMi43MjItMjIuNzIx` +
      `LTIyLjcyMmgtLjY3OGMtMTIuNTQ5IDAtMjIuNzIyIDEwLjE3My0yMi43MjIgMjIuNzIydi42Nzd` +
      `hMjIuNzIyIDIyLjcyMiAwIDAgMCAxMy4xMDEgMjAuNDh2MjkuNTA2YTY0LjM0MiA2NC4zNDIgMC` +
      `AwIDAgLTMwLjU5NCAxMy40N2wtODAuOTIyLTYzLjAzYy41NzctMi4wODMuODc4LTQuMjI1LjkxM` +
      `i02LjM3NWEyNS42IDI1LjYgMCAxIDAgLTI1LjYzMyAyNS41NSAyNS4zMjMgMjUuMzIzIDAgMCAw` +
      `IDEyLjYwNy0zLjQzbDc5LjY4NSA2Mi4wMDdjLTE0LjY1IDIyLjEzMS0xNC4yNTggNTAuOTc0Ljk` +
      `4NyA3Mi43bC0yNC4yMzYgMjQuMjQzYy0xLjk2LS42MjYtNC0uOTU5LTYuMDU3LS45ODctMTEuNj` +
      `A3LjAxLTIxLjAxIDkuNDIzLTIxLjAwNyAyMS4wMy4wMDMgMTEuNjA2IDkuNDEyIDIxLjAxNCAyM` +
      `S4wMTggMjEuMDE3IDExLjYwNy4wMDMgMjEuMDItOS40IDIxLjAzLTIxLjAwN2EyMC43NDcgMjAu` +
      `NzQ3IDAgMCAwIC0uOTg4LTYuMDU2bDIzLjk3Ni0yMy45ODVjMjEuNDIzIDE2LjQ5MiA1MC44NDY` +
      `gMTcuOTEzIDczLjc1OSAzLjU2MiAyMi45MTItMTQuMzUyIDM0LjQ3NS00MS40NDYgMjguOTg1LT` +
      `Y3LjkxOC01LjQ5LTI2LjQ3My0yNi44NzMtNDYuNzM0LTUzLjYwMy01MC43OTJtLTkuOTM4IDk3L` +
      `jA0NGEzMy4xNyAzMy4xNyAwIDEgMSAwLTY2LjMxNmMxNy44NS42MjUgMzIgMTUuMjcyIDMyLjAx` +
      `IDMzLjEzNC4wMDggMTcuODYtMTQuMTI3IDMyLjUyMi0zMS45NzcgMzMuMTY1IiBmaWxsPSIjZmY` +
      `3YTU5Ii8+PC9zdmc+`,
    logo_file_name: 'hubspot-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(HUBSPOT_APP_NAME, HUBSPOT_COMPANIES_ACTIONS, locale),
      ...mapActionsToApp(HUBSPOT_APP_NAME, HUBSPOT_CONTACTS_ACTIONS, locale),
      ...mapActionsToApp(HUBSPOT_APP_NAME, HUBSPOT_CUSTOM_OBJECTS_ACTIONS, locale),
      ...mapActionsToApp(HUBSPOT_APP_NAME, HUBSPOT_DEALS_ACTIONS, locale),
      ...mapActionsToApp(HUBSPOT_APP_NAME, HUBSPOT_LEADS_ACTIONS, locale),
      ...mapActionsToApp(HUBSPOT_APP_NAME, HUBSPOT_PRODUCTS_ACTIONS, locale),
      ...mapActionsToApp(HUBSPOT_APP_NAME, HUBSPOT_TICKETS_ACTIONS, locale),
      ...mapActionsToApp(HUBSPOT_APP_NAME, HUBSPOT_USERS_ACTIONS, locale),
      ...mapActionsToApp(HUBSPOT_APP_NAME, HUBSPOT_LISTS_ACTIONS, locale),
      ...mapActionsToApp(HUBSPOT_APP_NAME, HUBSPOT_FORMS_ACTIONS, locale),
      ...mapActionsToApp(HUBSPOT_APP_NAME, HUBSPOT_ACTIONS, locale),
      ...mapTriggersToApp(HUBSPOT_APP_NAME, HUBSPOT_TRIGGERS, locale),
    ],
    rest: getHubspotRestOptions(),
    swagger_options: {
      parse_flags: 128,
    },
    ...hubspotSchemaMetadata(),
    search_options: HubspotSearchOptions,
    upsert_options: HubspotUpsertOptions,
    expressions: getHubspotExpressions(locale),
    get_record_type: getHubspotRecordType,
    get_table_list: getHubspotTableList,
    search_records: searchHubspotRecords,
    create_records: createHubspotRecords,
    update_records: updateHubspotRecords,
    delete_records: deleteHubspotRecords,
    upsert_records: upsertHubspotRecords,
  }) satisfies TQoreAppWithActions & TQoreRecordBasedApp;
