import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import * as AMAZON_CLOUDFRONT_ACTIONS from './actions';
import * as AMAZON_CLOUDFRONT_TRIGGERS from './triggers';
import { AMAZON_CLOUDFRONT_APP_LOGO, AMAZON_CLOUDFRONT_APP_NAME } from './constants';

export default (locale: Locales) =>
  ({
    name: AMAZON_CLOUDFRONT_APP_NAME,
    display_name: L[locale].apps[AMAZON_CLOUDFRONT_APP_NAME].displayName(),
    short_desc: L[locale].apps[AMAZON_CLOUDFRONT_APP_NAME].shortDesc(),
    desc: L[locale].apps[AMAZON_CLOUDFRONT_APP_NAME].longDesc(),
    logo: AMAZON_CLOUDFRONT_APP_LOGO,
    logo_file_name: 'amazon-cloudfront-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(AMAZON_CLOUDFRONT_APP_NAME, AMAZON_CLOUDFRONT_ACTIONS, locale),
      ...mapTriggersToApp(AMAZON_CLOUDFRONT_APP_NAME, AMAZON_CLOUDFRONT_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://cloudfront.amazonaws.com',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/2020-05-31/distribution',
    },
    rest_modifiers: {
      aws_service: 'cloudfront',
    },
  }) satisfies TQoreAppWithActions;
