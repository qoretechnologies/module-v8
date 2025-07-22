import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
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
      url: '{{instance_url}}',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/api/3/users/me',
    },
    rest_modifiers: {
      options: ACTIVE_CAMPAIGN_CONN_OPTIONS,
      required_options: 'instance_url,api_key',
      url_template_options: ['subdomain'],
    },
  }) satisfies TQoreAppWithActions;
