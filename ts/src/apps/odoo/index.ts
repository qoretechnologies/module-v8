import {
  TQoreAppActionFunctionContext,
  TQoreAppWithActions,
  TQoreMappedOptions,
} from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapActionsToApp,
  mapTriggersToApp,
} from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { ODOO_APP_LOGO, ODOO_APP_NAME, ODOO_CONN_OPTIONS, OdooError } from './constants';
import * as ODOO_ACTIONS from './actions';
import * as ODOO_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[ODOO_APP_NAME].displayName(),
    short_desc: L[locale].apps[ODOO_APP_NAME].shortDesc(),
    desc: L[locale].apps[ODOO_APP_NAME].longDesc(),
    name: ODOO_APP_NAME,
    actions: [
      ...mapActionsToApp(ODOO_APP_NAME, ODOO_ACTIONS, locale),
      ...mapTriggersToApp(ODOO_APP_NAME, ODOO_TRIGGERS, locale),
    ],
    logo: ODOO_APP_LOGO,
    logo_file_name: 'odoo-logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://{{subdomain}}.odoo.com',
      data: 'json',
      oauth2_grant_type: 'none',
      ping_method: 'POST',
      ping_path: '/jsonrpc',
      ping_body: {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'common',
          method: 'login',
          args: [],
        },
        id: 1,
      },
    },
    rest_modifiers: {
      options: ODOO_CONN_OPTIONS,
      required_options: 'subdomain,username,password',
      url_template_options: ['subdomain'],
      set_options_post_auth: (
        context: Omit<TQoreAppActionFunctionContext<typeof ODOO_CONN_OPTIONS>, 'opts'>
      ): TQoreMappedOptions<typeof ODOO_CONN_OPTIONS> => {
        const { subdomain, username, password } = getQoreContextRequiredValues({
          context,
          connectionFields: ['subdomain', 'username', 'password'],
          ErrorClass: OdooError,
        });

        let formattedSubdomain = subdomain.trim().toLowerCase();

        if (subdomain.includes('.odoo.com')) {
          formattedSubdomain = subdomain.split('.')[0];
        }

        return {
          url: `https://${formattedSubdomain}.odoo.com`,
          username,
          password,
          subdomain,
          ping_body: {
            jsonrpc: '2.0',
            method: 'call',
            params: {
              service: 'common',
              method: 'login',
              args: [formattedSubdomain, username, password],
            },
            id: 1,
          },
        };
      },
    },
  }) satisfies TQoreAppWithActions;
