import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { GITLAB_ACTIONS } from './allowed-paths';
import { GITLAB_APP_LOGO, GITLAB_APP_NAME, GITLAB_CONN_OPTIONS } from './constants';

import * as GITLAB_ADDITIONAL_ACTIONS from './actions';
import * as GITLAB_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: GITLAB_APP_NAME,
    display_name: L[locale].apps[GITLAB_APP_NAME].displayName(),
    short_desc: L[locale].apps[GITLAB_APP_NAME].shortDesc(),
    desc: L[locale].apps[GITLAB_APP_NAME].longDesc(),
    logo: GITLAB_APP_LOGO,
    logo_file_name: 'gitlab-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(
        GITLAB_APP_NAME,
        { ...GITLAB_ACTIONS, ...GITLAB_ADDITIONAL_ACTIONS },
        locale
      ),
      ...mapTriggersToApp(GITLAB_APP_NAME, GITLAB_TRIGGERS, locale),
    ],
    swagger: 'schemas/gitlab.swagger.json',
    // swagger_paths: createSwaggerPaths(GITLAB_ALLOWED_PATHS),
    swagger_options: {
      parse_flags: -1,
    },
    rest: {
      url: 'auto',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: '{{hostname}}/oauth/authorize',
      oauth2_token_url: '{{hostname}}/oauth/token',
      oauth2_scopes: ['api', 'profile', 'email'],
      ping_method: 'GET',
      ping_path: `/api/v4/user`,
    },
    rest_modifiers: {
      options: GITLAB_CONN_OPTIONS,
      required_options: 'hostname',
      url_template_options: ['hostname'],
      url_from_option: 'hostname',
    },
  }) satisfies TQoreAppWithActions;
