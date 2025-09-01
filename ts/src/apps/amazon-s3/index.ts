import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import * as AMAZON_S3_ACTIONS from './actions';
import * as AMAZON_S3_TRIGGERS from './triggers';
import { AMAZON_S3_APP_LOGO, AMAZON_S3_APP_NAME, AMAZON_S3_CONN_OPTIONS } from './constants';

export default (locale: Locales) =>
  ({
    name: AMAZON_S3_APP_NAME,
    display_name: L[locale].apps[AMAZON_S3_APP_NAME].displayName(),
    short_desc: L[locale].apps[AMAZON_S3_APP_NAME].shortDesc(),
    desc: L[locale].apps[AMAZON_S3_APP_NAME].longDesc(),
    logo: AMAZON_S3_APP_LOGO,
    logo_file_name: 'amazon-s3-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(AMAZON_S3_APP_NAME, AMAZON_S3_ACTIONS, locale),
      ...mapTriggersToApp(AMAZON_S3_APP_NAME, AMAZON_S3_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://s3.amazonaws.com',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/',
    },
    rest_modifiers: {
      options: AMAZON_S3_CONN_OPTIONS,
      required_options: 'access_key_id,secret_access_key,region',
    },
  }) satisfies TQoreAppWithActions;
