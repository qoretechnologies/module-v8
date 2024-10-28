import { actionsCatalogue } from '../../ActionsCatalogue';
import { buildActionsFromSwaggerSchema, mapActionsToApp } from '../../global/helpers';
import {
  GetConnectionOptionDefinitionFromQoreType,
  IQoreAppWithActions,
  TQoreType,
} from '../../global/models/qore';
import { L } from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import ZendeskSchema from '../../schemas/zendesk.swagger.json';
import { ZENDESK_SWAGGER_API_PATH } from './constants';

export interface IQoreConnectionOptions {
  [key: string]: GetConnectionOptionDefinitionFromQoreType<TQoreType>;
}

export interface IQoreConnectionOptionsValues {
  [key: string]: any;
}

export const ZENDESK_APP_NAME = 'Zendesk';
export const ZENDESK_CONN_OPTIONS = {
  subdomain: {
    display_name: 'Subdomain',
    short_desc: 'The subdomain for the URL',
    desc: 'The subdomain for the URL',
    type: 'string',
  },
} satisfies IQoreConnectionOptions;

export const ZENDESK_ALLOWED_PATHS = [
  '/api/v2/account/settings',
  '/api/v2/tickets',
  '/api/v2/tickets/{ticket_id}',
  '/api/v2/users',
  '/api/v2/users/{user_id}',
  //'/api/v2/deleted_users/{deleted_user_id}',
  '/api/v2/organizations',
  '/api/v2/organizations/{organization_id}',
  //'/api/v2/macros',
  //'/api/v2/macros/{macro_id}',
  '/api/v2/search',
  //'/api/v2/ticket_fields',
  //'/api/v2/ticket_fields/{ticket_field_id}',
  '/api/v2/ticket_metrics',
  '/api/v2/ticket_metrics/{ticket_metric_id}',
];

export const ZENDESK_ACTIONS = buildActionsFromSwaggerSchema(
  ZendeskSchema as any,
  ZENDESK_ALLOWED_PATHS
);

/*
 * Returns the app object with all the actions ready to use, using translations
 * @param locale - the locale
 * @returns IQoreAppWithActions
 */
export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[ZENDESK_APP_NAME].displayName(),
    short_desc: L[locale].apps[ZENDESK_APP_NAME].shortDesc(),
    name: ZENDESK_APP_NAME,
    actions: mapActionsToApp(ZENDESK_APP_NAME, ZENDESK_ACTIONS, locale),
    desc: L[locale].apps[ZENDESK_APP_NAME].longDesc(),
    // This is a white Zendesk styled "Z" logo used in accordance with Zendesk's Brand / Logo Guidelines
    // https://web-assets.zendesk.com/pdf/Zendesk-logo-guidelines-legal-04-22-22.pdf
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
    swagger_paths: [
        `${ZENDESK_SWAGGER_API_PATH}tickets/{id}:GET`,
        `${ZENDESK_SWAGGER_API_PATH}tickets:GET`,
        `${ZENDESK_SWAGGER_API_PATH}tickets:POST`,
        `${ZENDESK_SWAGGER_API_PATH}tickets/count:GET`,
        `${ZENDESK_SWAGGER_API_PATH}tickets/{id}:PUT`,
        `${ZENDESK_SWAGGER_API_PATH}tickets/{id}:DELETE`,
        `${ZENDESK_SWAGGER_API_PATH}groups/{group_id}:DELETE`,
        `${ZENDESK_SWAGGER_API_PATH}groups/{group_id}:GET`,
        `${ZENDESK_SWAGGER_API_PATH}groups:GET`,
        `${ZENDESK_SWAGGER_API_PATH}groups:POST`,
        `${ZENDESK_SWAGGER_API_PATH}groups/{group_id}:PUT`,
        `${ZENDESK_SWAGGER_API_PATH}attachments/{attachment_id}:GET`,
        `${ZENDESK_SWAGGER_API_PATH}uploads/{token}:DELETE`,
        `${ZENDESK_SWAGGER_API_PATH}users/{id}:DELETE`,
        `${ZENDESK_SWAGGER_API_PATH}users/{user_id}:PUT`,
        `${ZENDESK_SWAGGER_API_PATH}users:POST`,
        `${ZENDESK_SWAGGER_API_PATH}users/{user_id}:GET`,
        `${ZENDESK_SWAGGER_API_PATH}users:GET`,
        `${ZENDESK_SWAGGER_API_PATH}organizations/{organization_id}:DELETE`,
        `${ZENDESK_SWAGGER_API_PATH}organizations/{organization_id}:GET`,
        `${ZENDESK_SWAGGER_API_PATH}organizations/{organization_id}:PUT`,
        `${ZENDESK_SWAGGER_API_PATH}organizations:POST`,
        `${ZENDESK_SWAGGER_API_PATH}organizations:GET`,
        `${ZENDESK_SWAGGER_API_PATH}account/settings:GET`,
        `${ZENDESK_SWAGGER_API_PATH}account/settings:PUT`,
        //`${ZENDESK_SWAGGER_API_PATH}deleted_users/{deleted_user_id}:DELETE`,
        //`${ZENDESK_SWAGGER_API_PATH}deleted_users/{deleted_user_id}:GET`,
        //`${ZENDESK_SWAGGER_API_PATH}macros:GET`,
        //`${ZENDESK_SWAGGER_API_PATH}macros:POST`,
        //`${ZENDESK_SWAGGER_API_PATH}macros/{macro_id}:DELETE`,
        //`${ZENDESK_SWAGGER_API_PATH}macros/{macro_id}:GET`,
        //`${ZENDESK_SWAGGER_API_PATH}macros/{macro_id}:PUT`,
        `${ZENDESK_SWAGGER_API_PATH}search:GET`,
        //`${ZENDESK_SWAGGER_API_PATH}ticket_fields:GET`,
        //`${ZENDESK_SWAGGER_API_PATH}ticket_fields:POST`,
        //`${ZENDESK_SWAGGER_API_PATH}ticket_fields/{ticket_field_id}:DELETE`,
        //`${ZENDESK_SWAGGER_API_PATH}ticket_fields/{ticket_field_id}:GET`,
        //`${ZENDESK_SWAGGER_API_PATH}ticket_fields/{ticket_field_id}:PUT`,
        `${ZENDESK_SWAGGER_API_PATH}ticket_metrics:GET`,
        `${ZENDESK_SWAGGER_API_PATH}ticket_metrics/{ticket_metric_id}:GET`,
    ],
    rest: {
      url: `https://{{subdomain}}.zendesk.com`,
      data: 'json',
      oauth2_client_secret: actionsCatalogue.getOauth2ClientSecret(ZENDESK_APP_NAME),
      oauth2_grant_type: 'authorization_code',
      oauth2_client_id: 'zdg-qorus-integration-engine',
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
  }) satisfies IQoreAppWithActions<typeof ZENDESK_CONN_OPTIONS>;
