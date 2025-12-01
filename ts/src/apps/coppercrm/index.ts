import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { COPPER_CRM_APP_LOGO, COPPER_CRM_APP_NAME, COPPER_CRM_CONN_OPTIONS } from './constants';

import * as COPPER_CRM_ACTIONS from './actions';
import * as COPPER_CRM_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: COPPER_CRM_APP_NAME,
    display_name: L[locale].apps[COPPER_CRM_APP_NAME].displayName(),
    short_desc: L[locale].apps[COPPER_CRM_APP_NAME].shortDesc(),
    desc: L[locale].apps[COPPER_CRM_APP_NAME].longDesc(),
    logo: COPPER_CRM_APP_LOGO,
    logo_file_name: 'copper-crm-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(COPPER_CRM_APP_NAME, COPPER_CRM_ACTIONS, locale),
      ...mapTriggersToApp(COPPER_CRM_APP_NAME, COPPER_CRM_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api.copper.com',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: `/developer_api/v1/users/me`,
    },
    rest_modifiers: {
      options: COPPER_CRM_CONN_OPTIONS,
      required_options: 'token,email',
    },
  }) satisfies TQoreAppWithActions;
