import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import * as AMAZON_SNS_ACTIONS from './actions';
import * as AMAZON_SNS_TRIGGERS from './triggers';
import { AMAZON_SNS_APP_LOGO, AMAZON_SNS_APP_NAME } from './constants';

export default (locale: Locales) =>
  ({
    name: AMAZON_SNS_APP_NAME,
    display_name: L[locale].apps[AMAZON_SNS_APP_NAME].displayName(),
    short_desc: L[locale].apps[AMAZON_SNS_APP_NAME].shortDesc(),
    desc: L[locale].apps[AMAZON_SNS_APP_NAME].longDesc(),
    logo: AMAZON_SNS_APP_LOGO,
    logo_file_name: 'amazon-sns-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(AMAZON_SNS_APP_NAME, AMAZON_SNS_ACTIONS, locale),
      ...mapTriggersToApp(AMAZON_SNS_APP_NAME, AMAZON_SNS_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://sns.{{region}}.amazonaws.com',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/?Action=ListTopics&Version=2010-03-31',
    },
    rest_modifiers: {
      aws_service: 'sns',
      url_template_options: ['region'],
    },
  }) satisfies TQoreAppWithActions;
