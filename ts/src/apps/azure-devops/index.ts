import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import {
  AZURE_DEVOPS_API_VERSION,
  AZURE_DEVOPS_APP_LOGO,
  AZURE_DEVOPS_APP_NAME,
  AZURE_DEVOPS_CONN_OPTIONS,
} from './constants';

import * as AZURE_DEVOPS_ACTIONS from './actions';
import * as AZURE_DEVOPS_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: AZURE_DEVOPS_APP_NAME,
    display_name: L[locale].apps[AZURE_DEVOPS_APP_NAME].displayName(),
    short_desc: L[locale].apps[AZURE_DEVOPS_APP_NAME].shortDesc(),
    desc: L[locale].apps[AZURE_DEVOPS_APP_NAME].longDesc(),
    logo: AZURE_DEVOPS_APP_LOGO,
    logo_file_name: 'azure-devops-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(AZURE_DEVOPS_APP_NAME, AZURE_DEVOPS_ACTIONS, locale),
      ...mapTriggersToApp(AZURE_DEVOPS_APP_NAME, AZURE_DEVOPS_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://app.vssps.visualstudio.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      oauth2_token_url: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      ping_method: 'GET',
      ping_path: `/_apis/profile/profiles/me?api-version=${AZURE_DEVOPS_API_VERSION}`,
    },
    rest_modifiers: {
      options: AZURE_DEVOPS_CONN_OPTIONS,
      required_options: 'organization',
    },
  }) satisfies TQoreAppWithActions;
