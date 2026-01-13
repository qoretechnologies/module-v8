/**
 * BambooHR App Integration
 *
 * Provides employee management actions for BambooHR.
 * Uses Basic Auth with API key authentication.
 *
 * @see https://documentation.bamboohr.com/reference
 */

import { TQoreAppActionFunctionContext, TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp } from '../../global/helpers/index';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import {
  BAMBOOHR_APP_LOGO,
  BAMBOOHR_APP_NAME,
  BAMBOOHR_BASE_URL,
  BAMBOOHR_CONN_OPTIONS,
} from './constants';

import * as BAMBOOHR_ACTIONS from './actions';

export default (locale: Locales) =>
  ({
    name: BAMBOOHR_APP_NAME,
    display_name: L[locale].apps[BAMBOOHR_APP_NAME].displayName(),
    short_desc: L[locale].apps[BAMBOOHR_APP_NAME].shortDesc(),
    desc: L[locale].apps[BAMBOOHR_APP_NAME].longDesc(),
    actions: mapActionsToApp(BAMBOOHR_APP_NAME, BAMBOOHR_ACTIONS, locale),
    logo: BAMBOOHR_APP_LOGO,
    logo_file_name: 'bamboohr-logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: BAMBOOHR_BASE_URL,
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'GET',
      ping_path: '/${company_domain}/v1/meta/fields',
      ping_headers: {
        Authorization: 'Basic ${base64_encode("${api_key}:x")}',
        Accept: 'application/json',
      },
    },
    rest_modifiers: {
      options: BAMBOOHR_CONN_OPTIONS,
      required_options: 'api_key,company_domain',
      set_options_post_auth: (
        context: Omit<TQoreAppActionFunctionContext<typeof BAMBOOHR_CONN_OPTIONS>, 'opts'>
      ) => {
        const company_domain = context.conn_opts?.company_domain;
        return {
          company_domain,
        };
      },
    },
  }) satisfies TQoreAppWithActions;
