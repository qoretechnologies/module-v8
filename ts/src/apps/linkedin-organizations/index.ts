import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';

import * as LINKED_IN_ACTIONS from './actions';
import * as LINKED_IN_TRIGGERS from './triggers';
import {
  LINKED_IN_ORGANIZATIONS_APP_NAME,
  LINKED_IN_ORGANIZATIONS_APP_LOGO,
  LINKED_IN_ORGANIZATIONS_API_VERSION,
} from './constants';

export default (locale: Locales) =>
  ({
    name: LINKED_IN_ORGANIZATIONS_APP_NAME,
    display_name: L[locale].apps[LINKED_IN_ORGANIZATIONS_APP_NAME].displayName(),
    short_desc: L[locale].apps[LINKED_IN_ORGANIZATIONS_APP_NAME].shortDesc(),
    desc: L[locale].apps[LINKED_IN_ORGANIZATIONS_APP_NAME].longDesc(),
    logo: LINKED_IN_ORGANIZATIONS_APP_LOGO,
    logo_file_name: 'linkedin-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(LINKED_IN_ORGANIZATIONS_APP_NAME, LINKED_IN_ACTIONS, locale),
      ...mapTriggersToApp(LINKED_IN_ORGANIZATIONS_APP_NAME, LINKED_IN_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api.linkedin.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_scopes: ['r_dma_admin_pages_content'],
      oauth2_auth_url: 'https://www.linkedin.com/oauth/v2/authorization',
      oauth2_token_url: 'https://www.linkedin.com/oauth/v2/accessToken',
      ping_headers: {
        'LinkedIn-Version': LINKED_IN_ORGANIZATIONS_API_VERSION,
      },
      ping_method: 'GET',
      ping_path: '/rest/dmaMe',
    },
  }) satisfies TQoreAppWithActions;
