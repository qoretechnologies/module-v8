import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers/index';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { SUPABASE_APP_LOGO, SUPABASE_APP_NAME, SUPABASE_CONN_OPTIONS } from './constants';

import * as SUPABASE_ACTIONS from './actions';
import * as SUPABASE_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[SUPABASE_APP_NAME].displayName(),
    short_desc: L[locale].apps[SUPABASE_APP_NAME].shortDesc(),
    desc: L[locale].apps[SUPABASE_APP_NAME].longDesc(),
    name: SUPABASE_APP_NAME,
    actions: [
      ...mapActionsToApp(SUPABASE_APP_NAME, SUPABASE_ACTIONS, locale),
      ...mapTriggersToApp(SUPABASE_APP_NAME, SUPABASE_TRIGGERS, locale),
    ],
    logo: SUPABASE_APP_LOGO,
    logo_file_name: 'supabase-logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://{{projectId}}.supabase.co',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/rest/v1/',
      token_api_key_header: 'apikey',
    },
    rest_modifiers: {
      options: SUPABASE_CONN_OPTIONS,
      required_options: 'projectId,token',
      url_template_options: ['projectId'],
    },
  }) satisfies TQoreAppWithActions;
