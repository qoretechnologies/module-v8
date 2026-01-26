import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import * as AMAZON_CLOUDWATCH_ACTIONS from './actions';
import { AMAZON_CLOUDWATCH_APP_LOGO, AMAZON_CLOUDWATCH_APP_NAME } from './constants';
import * as AMAZON_CLOUDWATCH_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: AMAZON_CLOUDWATCH_APP_NAME,
    display_name: L[locale].apps[AMAZON_CLOUDWATCH_APP_NAME].displayName(),
    short_desc: L[locale].apps[AMAZON_CLOUDWATCH_APP_NAME].shortDesc(),
    desc: L[locale].apps[AMAZON_CLOUDWATCH_APP_NAME].longDesc(),
    logo: AMAZON_CLOUDWATCH_APP_LOGO,
    logo_file_name: 'amazon-cloudwatch-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(AMAZON_CLOUDWATCH_APP_NAME, AMAZON_CLOUDWATCH_ACTIONS, locale),
      ...mapTriggersToApp(AMAZON_CLOUDWATCH_APP_NAME, AMAZON_CLOUDWATCH_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://monitoring.{{region}}.amazonaws.com',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/?Action=ListMetrics&Version=2010-08-01',
    },
    rest_modifiers: {
      aws_service: 'monitoring',
      url_template_options: ['region'],
    },
  }) satisfies TQoreAppWithActions;
