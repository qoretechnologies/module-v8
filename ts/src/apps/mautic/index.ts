import { TQoreAppActionFunctionContext, TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { MAUTIC_APP_NAME, MAUTIC_LOGO, MAUTIC_CONN_OPTIONS } from './constants';

import * as MAUTIC_ACTIONS from './actions';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[MAUTIC_APP_NAME].displayName(),
    short_desc: L[locale].apps[MAUTIC_APP_NAME].shortDesc(),
    desc: L[locale].apps[MAUTIC_APP_NAME].longDesc(),
    name: MAUTIC_APP_NAME,
    actions: [...mapActionsToApp(MAUTIC_APP_NAME, MAUTIC_ACTIONS, locale)],
    logo: MAUTIC_LOGO,
    logo_file_name: 'logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'auto',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/api/contacts?limit=1',
      token_type: 'basic',
    },
    rest_modifiers: {
      options: MAUTIC_CONN_OPTIONS,
      required_options: 'instance_url,username,password',
      set_options_post_auth: (
        context: Omit<TQoreAppActionFunctionContext<typeof MAUTIC_CONN_OPTIONS>, 'opts'>
      ) => {
        const instance_url = context.conn_opts?.instance_url;

        return {
          baseUrl: instance_url,
          url: instance_url,
        };
      },
      url_from_option: 'instance_url',
    },
  }) satisfies TQoreAppWithActions;
