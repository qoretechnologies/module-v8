import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { Locales } from '../../i18n/i18n-types';
import { BITBUCKET_APP_LOGO, BITBUCKET_APP_NAME } from './constants';
import L from '../../i18n/i18n-node';
import { mapActionsToApp } from '../../global/helpers';
import { BITBUCKET_ACTIONS, BITBUCKET_ALLOWED_PATHS } from './allowed-paths';

export default (locale: Locales) =>
  ({
    name: BITBUCKET_APP_NAME,
    display_name: L[locale].apps[BITBUCKET_APP_NAME].displayName(),
    short_desc: L[locale].apps[BITBUCKET_APP_NAME].shortDesc(),
    desc: L[locale].apps[BITBUCKET_APP_NAME].longDesc(),
    logo: BITBUCKET_APP_LOGO,
    logo_file_name: 'bitbucket-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [...mapActionsToApp(BITBUCKET_APP_NAME, BITBUCKET_ACTIONS, locale)],
    swagger_paths: BITBUCKET_ALLOWED_PATHS,
    rest: {
      url: 'https://api.bitbucket.org',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_scopes: [],
      oauth2_auth_url: 'https://bitbucket.org/site/oauth2/authorize',
      oauth2_token_url: 'https://bitbucket.org/site/oauth2/access_token',
      ping_method: 'GET',
      ping_path: '/2.0/user',
    },
    swagger_options: {
      parse_flags: -1,
    },
    swagger: 'schemas/bitbucket.swagger.json',
  }) satisfies TQoreAppWithActions;
