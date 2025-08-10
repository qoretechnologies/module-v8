import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import {
  HUGGING_FACE_APP_LOGO,
  HUGGING_FACE_APP_NAME,
  HUGGING_FACE_CONN_OPTIONS,
} from './constants';

import * as HUGGING_FACE_ACTIONS from './actions';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[HUGGING_FACE_APP_NAME].displayName(),
    short_desc: L[locale].apps[HUGGING_FACE_APP_NAME].shortDesc(),
    desc: L[locale].apps[HUGGING_FACE_APP_NAME].longDesc(),
    name: HUGGING_FACE_APP_NAME,
    actions: [...mapActionsToApp(HUGGING_FACE_APP_NAME, HUGGING_FACE_ACTIONS, locale)],
    logo: HUGGING_FACE_APP_LOGO,
    logo_file_name: 'logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://huggingface.co',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/api/models',
    },
    rest_modifiers: {
      options: HUGGING_FACE_CONN_OPTIONS,
      required_options: 'token',
    },
  }) satisfies TQoreAppWithActions;
