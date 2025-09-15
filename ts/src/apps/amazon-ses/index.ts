import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import * as AMAZON_SES_ACTIONS from './actions';
import * as AMAZON_SES_TRIGGERS from './triggers';
import { AMAZON_SES_APP_LOGO, AMAZON_SES_APP_NAME } from './constants';

export default (locale: Locales) =>
  ({
    name: AMAZON_SES_APP_NAME,
    display_name: L[locale].apps[AMAZON_SES_APP_NAME].displayName(),
    short_desc: L[locale].apps[AMAZON_SES_APP_NAME].shortDesc(),
    desc: L[locale].apps[AMAZON_SES_APP_NAME].longDesc(),
    logo: AMAZON_SES_APP_LOGO,
    logo_file_name: 'amazon-ses-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(AMAZON_SES_APP_NAME, AMAZON_SES_ACTIONS, locale),
      ...mapTriggersToApp(AMAZON_SES_APP_NAME, AMAZON_SES_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://email.{{region}}.amazonaws.com',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/?Action=ListIdentities&Version=2010-12-01',
    },
    rest_modifiers: {
      aws_service: 'email',
      url_template_options: ['region'],
    },
  }) satisfies TQoreAppWithActions;
