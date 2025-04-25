import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { createSwaggerPaths, mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { XERO_ACCOUNTING_ACTIONS, XERO_ACCOUNTING_ALLOWED_PATHS } from './allowed-paths/accounting';
import { XERO_PROJECTS_ACTIONS, XERO_PROJECTS_ALLOWED_PATHS } from './allowed-paths/projects';
import { XERO_APP_LOGO, XERO_APP_NAME } from './constants';
import * as XERO_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: XERO_APP_NAME,
    display_name: L[locale].apps[XERO_APP_NAME].displayName(),
    short_desc: L[locale].apps[XERO_APP_NAME].shortDesc(),
    desc: L[locale].apps[XERO_APP_NAME].longDesc(),
    logo: XERO_APP_LOGO,
    logo_file_name: 'xero-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(XERO_APP_NAME, XERO_PROJECTS_ACTIONS, locale),
      ...mapActionsToApp(XERO_APP_NAME, XERO_ACCOUNTING_ACTIONS, locale),
      ...mapTriggersToApp(XERO_APP_NAME, XERO_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api.xero.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://login.xero.com/identity/connect/authorize',
      oauth2_token_url: 'https://identity.xero.com/connect/token',
      oauth2_scopes: [
        'openid',
        'email',
        'profile',
        'offline_access',
        'accounting.settings',
        'accounting.contacts',
        'accounting.attachments',
        'accounting.transactions',
        'accounting.reports.read',
        'accounting.journals.read',
        'projects',
        'payroll.employees',
        'payroll.payruns',
        'payroll.payslip',
        'payroll.timesheets',
        'payroll.settings',
      ],
      ping_method: 'GET',
      ping_path: '/connections',
    },
    swagger_options: {
      parse_flags: -1,
      query_date_format: 'YYYY-MM-DD',
    },
    swagger_schema_map: {
      accounting: {
        swagger: 'schemas/xero/accounting.swagger.json',
        swagger_paths: createSwaggerPaths(XERO_ACCOUNTING_ALLOWED_PATHS),
        swagger_options: {
          query_date_format: 'YYYY-MM-DD',
        },
      },
      projects: {
        swagger: 'schemas/xero/projects.swagger.json',
        swagger_paths: createSwaggerPaths(XERO_PROJECTS_ALLOWED_PATHS),
      },
    },
  }) satisfies TQoreAppWithActions;
