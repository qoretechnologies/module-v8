import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import * as AWS_LAMBDA_ACTIONS from './actions';
import { AMAZON_LAMBDA_APP_NAME, AMAZON_LAMBDA_APP_LOGO } from './constants';
import * as AWS_LAMBDA_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: AMAZON_LAMBDA_APP_NAME,
    display_name: L[locale].apps[AMAZON_LAMBDA_APP_NAME].displayName(),
    short_desc: L[locale].apps[AMAZON_LAMBDA_APP_NAME].shortDesc(),
    desc: L[locale].apps[AMAZON_LAMBDA_APP_NAME].longDesc(),
    logo: AMAZON_LAMBDA_APP_LOGO,
    logo_file_name: 'aws-lambda-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(AMAZON_LAMBDA_APP_NAME, AWS_LAMBDA_ACTIONS, locale),
      ...mapTriggersToApp(AMAZON_LAMBDA_APP_NAME, AWS_LAMBDA_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://lambda.{{region}}.amazonaws.com/2015-03-31/functions',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/',
    },
    rest_modifiers: {
      aws_service: 'lambda',
      url_template_options: ['region'],
    },
  }) satisfies TQoreAppWithActions;
