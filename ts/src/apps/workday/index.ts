import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { actionsCatalogue } from '../../ActionsCatalogue';
import { mapActionsToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { WORKDAY_ATTACHMENTS_ACTIONS } from './allowed-paths/attachments';
import { WORKDAY_AWARDS_ACTIONS } from './allowed-paths/awards';
import { WORKDAY_CONTRACTS_ACTIONS } from './allowed-paths/contracts';
import { WORKDAY_EVENTS_ACTIONS } from './allowed-paths/events';
import { WORKDAY_FIELDS_ACTIONS } from './allowed-paths/fields';
import { WORKDAY_PAYMENTS_ACTIONS } from './allowed-paths/payments';
import { WORKDAY_PROJECTS_ACTIONS } from './allowed-paths/projects';
import { WORKDAY_REPORTS_ACTIONS } from './allowed-paths/reports';
import { WORKDAY_SUPPLIERS_ACTIONS } from './allowed-paths/suppliers';
import { WORKDAY_APP_NAME } from './constants';

export default (locale: Locales) =>
  ({
    name: WORKDAY_APP_NAME,
    display_name: L[locale].apps[WORKDAY_APP_NAME].displayName(),
    short_desc: L[locale].apps[WORKDAY_APP_NAME].shortDesc(),
    desc: L[locale].apps[WORKDAY_APP_NAME].longDesc(),
    logo:
      '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' +
      'J8b7/7f/AishsaGjK0vLAAAAAElFTkSuQmCC',
    logo_file_name: 'workday-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(WORKDAY_APP_NAME, WORKDAY_ATTACHMENTS_ACTIONS, locale),
      ...mapActionsToApp(WORKDAY_APP_NAME, WORKDAY_AWARDS_ACTIONS, locale),
      ...mapActionsToApp(WORKDAY_APP_NAME, WORKDAY_CONTRACTS_ACTIONS, locale),
      ...mapActionsToApp(WORKDAY_APP_NAME, WORKDAY_EVENTS_ACTIONS, locale),
      ...mapActionsToApp(WORKDAY_APP_NAME, WORKDAY_FIELDS_ACTIONS, locale),
      ...mapActionsToApp(WORKDAY_APP_NAME, WORKDAY_PAYMENTS_ACTIONS, locale),
      ...mapActionsToApp(WORKDAY_APP_NAME, WORKDAY_PROJECTS_ACTIONS, locale),
      ...mapActionsToApp(WORKDAY_APP_NAME, WORKDAY_REPORTS_ACTIONS, locale),
      ...mapActionsToApp(WORKDAY_APP_NAME, WORKDAY_SUPPLIERS_ACTIONS, locale),
    ],
    rest: {
      url: 'https://api.workday.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_client_id: '483b815d-b266-46c0-8dd5-c84bdb6c1331',
      oauth2_client_secret: actionsCatalogue.getOauth2ClientSecret(WORKDAY_APP_NAME),
      oauth2_auth_url: 'https://app.workday.com/oauth/authorize',
      oauth2_token_url: 'https://app.workday.com/oauth/token',
      oauth2_scopes: [],
      ping_method: 'GET',
      ping_path: '/ping',
    },
    swagger_options: {
      parse_flags: 128,
    },
    swagger_schema_map: {
      attachments: {
        swagger: 'schemas/workday/attachments.swagger.json',
      },
      awards: {
        swagger: 'schemas/workday/awards.swagger.json',
      },
      contracts: {
        swagger: 'schemas/workday/contracts.swagger.json',
      },
      events: {
        swagger: 'schemas/workday/events.swagger.json',
      },
      fields: {
        swagger: 'schemas/workday/fields.swagger.json',
      },
      payments: {
        swagger: 'schemas/workday/payments.swagger.json',
      },
      projects: {
        swagger: 'schemas/workday/projects.swagger.json',
      },
      reports: {
        swagger: 'schemas/workday/reports.swagger.json',
      },
      suppliers: {
        swagger: 'schemas/workday/suppliers.swagger.json',
      },
    },
  }) satisfies TQoreAppWithActions;
