import { TQoreAppWithActions, TQoreRecordBasedApp } from '@qoretechnologies/ts-toolkit';
import {
  buildActionsFromSwaggerSchema,
  createSwaggerPaths,
  mapActionsToApp,
  mapTriggersToApp,
} from '../../global/helpers';
import { L } from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import ZendeskSchema from '../../schemas/zendesk.swagger.json';
import { ZENDESK_APP_NAME, ZENDESK_CONN_OPTIONS } from './app-constants';
import { ZENDESK_ALLOWED_PATHS } from './constants';
import * as zendeskTriggers from './triggers';
import { createZendeskRecords } from './helpers/record-based/create-records';
import { deleteZendeskRecords } from './helpers/record-based/delete-records';
import { getZendeskExpressions } from './helpers/record-based/get-expressions';
import { getZendeskRecordType } from './helpers/record-based/get-record-type';
import { ZendeskSearchOptions } from './helpers/record-based/get-search-options';
import { getZendeskTableList } from './helpers/record-based/get-table-list';
import { searchZendeskRecords } from './helpers/record-based/search-records';
import { updateZendeskRecords } from './helpers/record-based/update-records';

export { ZENDESK_APP_NAME, ZENDESK_CONN_OPTIONS };

export const ZENDESK_ACTIONS = buildActionsFromSwaggerSchema({
  schema: ZendeskSchema as any,
  allowedPaths: ZENDESK_ALLOWED_PATHS,
  app: ZENDESK_APP_NAME,
});

export default (locale: Locales) =>
  ({
    name: ZENDESK_APP_NAME,
    display_name: L[locale].apps[ZENDESK_APP_NAME].displayName(),
    short_desc: L[locale].apps[ZENDESK_APP_NAME].shortDesc(),
    actions: [
      ...mapActionsToApp(ZENDESK_APP_NAME, ZENDESK_ACTIONS, locale),
      ...mapTriggersToApp(ZENDESK_APP_NAME, zendeskTriggers, locale),
    ],
    desc: L[locale].apps[ZENDESK_APP_NAME].longDesc(),
    logo:
      'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICIt' +
      'Ly9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+Cjxzdm' +
      'cgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDgwMCA4MDAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93' +
      'd3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sOnNwYWNlPSJwcmVzZX' +
      'J2ZSIgeG1sbnM6c2VyaWY9Imh0dHA6Ly93d3cuc2VyaWYuY29tLyIgc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVu' +
      'b2RkO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoyOyI+CiAgICA8cGF0aCBkPSJNMzczLjg1Nyw2NTkuODU3TD' +
      'U3LjE0Myw2NTkuODU3TDM3My44NTcsMjc3LjQ4NkwzNzMuODU3LDY1OS44NTdaTTc0Mi44NTcsNjU5Ljg1N0w0MjYuMTQzLDY1OS44NTdD' +
      'NDI2LjE0Myw1NzIuMzQzIDQ5Ni45NzEsNTAxLjQ4NiA1ODQuNTE0LDUwMS40ODZDNjcyLjAyOSw1MDEuNDg2IDc0Mi44NTcsNTcyLjQgNz' +
      'QyLjg1Nyw2NTkuODU3Wk00MjYuMTQzLDUyMi42TDQyNi4xNDMsMTQwLjE0M0w3NDIuODU3LDE0MC4xNDNMNDI2LjE0Myw1MjIuNlpNMzcz' +
      'Ljg1NywxNDAuMTQzQzM3My44NTcsMjI3LjYgMzAyLjk3MSwyOTguNTQzIDIxNS40ODYsMjk4LjU0M0MxMjguMDU3LDI5OC41NDMgNTcuMT' +
      'QzLDIyNy42NTcgNTcuMTQzLDE0MC4yTDM3My44NTcsMTQwLjJMMzczLjg1NywxNDAuMTQzWiIgc3R5bGU9ImZpbGw6d2hpdGU7ZmlsbC1y' +
      'dWxlOm5vbnplcm87Ii8+Cjwvc3ZnPgo=',
    logo_file_name: 'zendesk.svg',
    logo_mime_type: 'image/svg+xml',
    swagger: 'schemas/zendesk.swagger.json',
    swagger_options: {
      parse_flags: 128,
    },
    swagger_paths: createSwaggerPaths(ZENDESK_ALLOWED_PATHS),
    rest: {
      url: `https://{{subdomain}}.zendesk.com`,
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://{{subdomain}}.zendesk.com/oauth/authorizations/new',
      oauth2_token_url: 'https://{{subdomain}}.zendesk.com/oauth/tokens',
      oauth2_scopes: ['read', 'write'],
      ping_method: 'GET',
      ping_path: '/api/v2/users/me',
    },
    rest_modifiers: {
      options: ZENDESK_CONN_OPTIONS,
      required_options: 'subdomain',
      url_template_options: ['subdomain'],
    },
    expressions: getZendeskExpressions(locale),
    get_record_type: getZendeskRecordType,
    get_table_list: getZendeskTableList,
    search_options: ZendeskSearchOptions,
    search_records: searchZendeskRecords,
    create_records: createZendeskRecords,
    update_records: updateZendeskRecords,
    delete_records: deleteZendeskRecords,
  }) satisfies TQoreAppWithActions & TQoreRecordBasedApp;
