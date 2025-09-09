import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import * as AMAZON_SQS_ACTIONS from './actions';
import * as AMAZON_SQS_TRIGGERS from './triggers';
import { AMAZON_SQS_APP_LOGO, AMAZON_SQS_APP_NAME } from './constants';

export default (locale: Locales) =>
  ({
    name: AMAZON_SQS_APP_NAME,
    display_name: L[locale].apps[AMAZON_SQS_APP_NAME].displayName(),
    short_desc: L[locale].apps[AMAZON_SQS_APP_NAME].shortDesc(),
    desc: L[locale].apps[AMAZON_SQS_APP_NAME].longDesc(),
    logo: AMAZON_SQS_APP_LOGO,
    logo_file_name: 'amazon-sqs-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(AMAZON_SQS_APP_NAME, AMAZON_SQS_ACTIONS, locale),
      ...mapTriggersToApp(AMAZON_SQS_APP_NAME, AMAZON_SQS_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://sqs.{{region}}.amazonaws.com',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/?Action=ListQueues&Version=2012-11-05',
    },
    rest_modifiers: {
      aws_service: 'sqs',
      url_template_options: ['region'],
    },
  }) satisfies TQoreAppWithActions;
