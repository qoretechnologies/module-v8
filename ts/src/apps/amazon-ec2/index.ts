import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import * as AMAZON_EC2_ACTIONS from './actions';
import { AMAZON_EC2_APP_LOGO, AMAZON_EC2_APP_NAME } from './constants';
import * as AMAZON_EC2_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: AMAZON_EC2_APP_NAME,
    display_name: L[locale].apps[AMAZON_EC2_APP_NAME].displayName(),
    short_desc: L[locale].apps[AMAZON_EC2_APP_NAME].shortDesc(),
    desc: L[locale].apps[AMAZON_EC2_APP_NAME].longDesc(),
    logo: AMAZON_EC2_APP_LOGO,
    logo_file_name: 'amazon-ec2-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(AMAZON_EC2_APP_NAME, AMAZON_EC2_ACTIONS, locale),
      ...mapTriggersToApp(AMAZON_EC2_APP_NAME, AMAZON_EC2_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://ec2.amazonaws.com',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/?Action=DescribeRegions&Version=2016-11-15',
    },
    rest_modifiers: {
      aws_service: 'ec2',
    },
  }) satisfies TQoreAppWithActions;
