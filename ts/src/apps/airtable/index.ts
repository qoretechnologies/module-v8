import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { AIRTABLE_APP_LOGO, AIRTABLE_APP_NAME } from './constants';

import * as AIRTABLE_ACTIONS from './actions';
import * as AIRTABLE_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: AIRTABLE_APP_NAME,
    display_name: L[locale].apps[AIRTABLE_APP_NAME].displayName(),
    short_desc: L[locale].apps[AIRTABLE_APP_NAME].shortDesc(),
    desc: L[locale].apps[AIRTABLE_APP_NAME].longDesc(),
    logo: AIRTABLE_APP_LOGO,
    logo_file_name: 'airtable-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(AIRTABLE_APP_NAME, AIRTABLE_ACTIONS, locale),
      ...mapTriggersToApp(AIRTABLE_APP_NAME, AIRTABLE_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api.airtable.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://airtable.com/oauth2/v1/authorize',
      oauth2_token_url: 'https://airtable.com/oauth2/v1/token',
      oauth2_scopes: [
        'data.records:read',
        'data.records:write',
        'data.recordComments:read',
        'data.recordComments:write',
        'schema.bases:read',
        'schema.bases:write',
        'user.email:read',
        'webhook:manage',
      ],
      ping_method: 'GET',
      ping_path: '/v0/meta/whoami',
    },
  }) satisfies TQoreAppWithActions;
