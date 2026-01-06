import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { SURVEY_MONKEY_APP_LOGO, SURVEY_MONKEY_APP_NAME } from './constants';

import * as SURVEY_MONKEY_ACTIONS from './actions';
import * as SURVEY_MONKEY_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: SURVEY_MONKEY_APP_NAME,
    display_name: L[locale].apps[SURVEY_MONKEY_APP_NAME].displayName(),
    short_desc: L[locale].apps[SURVEY_MONKEY_APP_NAME].shortDesc(),
    desc: L[locale].apps[SURVEY_MONKEY_APP_NAME].longDesc(),
    logo: SURVEY_MONKEY_APP_LOGO,
    logo_file_name: 'surveymonkey-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(SURVEY_MONKEY_APP_NAME, SURVEY_MONKEY_ACTIONS, locale),
      ...mapTriggersToApp(SURVEY_MONKEY_APP_NAME, SURVEY_MONKEY_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api.surveymonkey.com/v3',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://api.surveymonkey.com/oauth/authorize',
      oauth2_token_url: 'https://api.surveymonkey.com/oauth/token',
      ping_method: 'GET',
      ping_path: '/users/me',
      // oauth2_scopes: [
      //   'surveys_read',
      //   'surveys_write',
      //   'contacts_read',
      //   'contacts_write',
      //   'responses_read',
      //   'responses_read_detail',
      //   'collectors_read',
      //   'collectors_write',
      //   'webhooks_read',
      //   'webhooks_write',
      // ],
    },
  }) satisfies TQoreAppWithActions;
