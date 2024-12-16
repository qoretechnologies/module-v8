import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { actionsCatalogue } from '../../ActionsCatalogue';
import { createSwaggerPaths, mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import { IQoreAllowedValue, IQoreAppWithActions } from '../../global/models/qore';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import {
  ESIGNATURE_ACTIONS,
  ESIGNATURE_APP_NAME,
  ESIGNATURE_CONN_OPTIONS,
  ESIGNATURE_PATHS,
} from './constants';

import * as ESIGNATURE_TRIGGERS from './triggers';

/*
 * Returns the app object with all the actions ready to use, using translations
 * @param locale - the locale
 * @returns IQoreAppWithActions
 */

export interface IEsignatureUserInfoAccount {
  account_id: string;
  account_name: string;
  base_uri: string;
  is_default: boolean;
  organization: {
    organization_id: string;
    links: {
      rel: string;
      href: string;
    }[];
  };
}

export interface IEsignatureUserInfo {
  sub: string;
  accounts: IEsignatureUserInfoAccount[];
  name: string;
  given_name: string;
  family_name: string;
  email: string;
}

const DisplayAllowedValues = [
  {
    display_name: 'modal',
    desc:
      'The document is shown as a supplement action strip and can be viewed, downloaded, or printed ' +
      'in a modal window. This is the recommended value for supplemental documents.',
    value: 'modal',
  },
  {
    display_name: 'inline',
    desc:
      'The document is shown in the normal signing window. This value is not used with supplemental ' +
      'documents, but is the default value for all other documents.',
    value: 'inline',
  },
] satisfies IQoreAllowedValue[];

const HrmlDisplayAllowedValues = [
  {
    display_name: 'inline',
    desc:
      'Leaves the HTML where it is in the document. This property lets you add a label or present on a separate ' +
      'page.',
    value: 'inline',
  },
  {
    display_name: 'collapsible',
    desc: 'The HTML in this section may be expanded or collapsed. Initially this section is expanded.',
    value: 'collapsible',
  },
  {
    display_name: 'collapsed',
    desc: 'The HTML in this section may be expanded or collapsed. Initially this section is collapsed.',
    value: 'collapsed',
  },
  {
    display_name: 'continue_button',
    desc:
      "Creates a stop point in the document to draw the reader's attention before proceeding to the next " +
      'section.',
    value: 'continue_button',
  },
  {
    display_name: 'responsive_table',
    desc:
      'Turns this section into a responsive table. Note that this is only used on HTML tables that fall within the ' +
      'anchor start and end positions.',
    value: 'responsive_table',
  },
  {
    display_name: 'responsive_table_single_column',
    desc:
      'Turns this section into a responsive single-column table. Note this is only used on HTML tables that fall ' +
      'within the anchor start and end positions. The table will be converted to one single column where each ' +
      'current column will become a row, then stacked.',
    value: 'collapsed',
  },
  {
    display_name: 'print_only',
    desc: 'Do not show this portion of the HTML in the responsive signing view.',
    value: 'print_only',
  },
] satisfies IQoreAllowedValue[];

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[ESIGNATURE_APP_NAME].displayName(),
    short_desc: L[locale].apps[ESIGNATURE_APP_NAME].shortDesc(),
    name: ESIGNATURE_APP_NAME,
    desc: L[locale].apps[ESIGNATURE_APP_NAME].longDesc(),
    actions: [
      ...mapTriggersToApp(ESIGNATURE_APP_NAME, ESIGNATURE_TRIGGERS, locale),
      ...mapActionsToApp(ESIGNATURE_APP_NAME, ESIGNATURE_ACTIONS, locale),
    ],
    logo:
      'PHN2ZyB2ZXJzaW9uPSIxLjIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDE1NDcgMTU0OSIg' +
      'd2lkdGg9IjE1NDciIGhlaWdodD0iMTU0OSI+Cgk8dGl0bGU+ZG9jdS1zdmc8L3RpdGxlPgoJPHN0eWxlPgoJCS5zMCB7IGZpbGw6ICM0YzAw' +
      'ZmYgfSAKCQkuczEgeyBmaWxsOiAjZmY1MjUyIH0gCgkJLnMyIHsgZmlsbDogIzAwMDAwMCB9IAoJPC9zdHlsZT4KCTxnIGlkPSJMYXllciI+' +
      'CgkJPHBhdGggaWQ9IkxheWVyIiBjbGFzcz0iczAiIGQ9Im0xMTEzLjQgMTExNC45djM5NS42YzAgMjAuOC0xNi43IDM3LjYtMzcuNSAzNy42' +
      'aC0xMDM4LjRjLTIwLjcgMC0zNy41LTE2LjgtMzcuNS0zNy42di0xMDM5YzAtMjAuNyAxNi44LTM3LjUgMzcuNS0zNy41aDM5NC4zdjY0My40' +
      'YzAgMjAuNyAxNi44IDM3LjUgMzcuNSAzNy41eiIvPgoJCTxwYXRoIGlkPSJMYXllciIgY2xhc3M9InMxIiBkPSJtMTU0NiA1NTcuMWMwIDMz' +
      'Mi40LTE5My45IDU1Ny00MzIuNiA1NTcuOHYtNDE4LjhjMC0xMi00LjgtMjQtMTMuNS0zMS45bC0yMTcuMS0yMTcuNGMtOC44LTguOC0yMC0x' +
      'My42LTMyLTEzLjZoLTQxOC4ydi0zOTQuOGMwLTIwLjggMTYuOC0zNy42IDM3LjUtMzcuNmg1ODUuMWMyNzcuNy0wLjggNDkwLjggMjIzIDQ5' +
      'MC44IDU1Ni4zeiIvPgoJCTxwYXRoIGlkPSJMYXllciIgY2xhc3M9InMyIiBkPSJtMTA5OS45IDY2My40YzguNyA4LjcgMTMuNSAxOS45IDEz' +
      'LjUgMzEuOXY0MTguOGgtNjQzLjNjLTIwLjcgMC0zNy41LTE2LjgtMzcuNS0zNy41di02NDMuNGg0MTguMmMxMiAwIDI0IDQuOCAzMiAxMy42' +
      'eiIvPgoJPC9nPgo8L3N2Zz4=',
    logo_file_name: 'esignature-logo.svg',
    logo_mime_type: 'image/svg+xml',
    swagger: 'schemas/esignature.swagger.json',
    swagger_paths: createSwaggerPaths(ESIGNATURE_PATHS),
    swagger_type_overrides: {
      'agent.email': {
        required: true,
      },
      'agent.name': {
        required: true,
      },
      'agent.routingOrder': {
        required: true,
        default_value: '1',
      },
      'carbonCopy.email': {
        required: true,
      },
      'carbonCopy.name': {
        required: true,
      },
      'carbonCopy.routingOrder': {
        required: true,
        default_value: '1',
      },
      'certifiedDelivery.email': {
        required: true,
      },
      'certifiedDelivery.name': {
        required: true,
      },
      'certifiedDelivery.routingOrder': {
        required: true,
        default_value: '1',
      },
      'document.display': {
        allowed_values: DisplayAllowedValues,
      },
      'document.fileExtension': {
        default_value: 'pdf',
      },
      'envelopeDocument.display': {
        allowed_values: DisplayAllowedValues,
      },
      'documentHtmlDisplaySettings.display': {
        allowed_values: HrmlDisplayAllowedValues,
      },
      'smartSectionDisplaySettings.display': {
        allowed_values: HrmlDisplayAllowedValues,
      },
      'document.documentBase64': {
        required: true,
      },
      'editor.email': {
        required: true,
      },
      'editor.name': {
        required: true,
      },
      'editor.recipientId': {
        required: true,
      },
      'editor.routingOrder': {
        required: true,
        default_value: '1',
      },
      'inPersonSigner.email': {
        required: true,
      },
      'inPersonSigner.name': {
        required: true,
      },
      'inPersonSigner.recipientId': {
        required: true,
      },
      'inPersonSigner.routingOrder': {
        required: true,
        default_value: '1',
      },
      'intermediary.email': {
        required: true,
      },
      'intermediary.name': {
        required: true,
      },
      'intermediary.recipientId': {
        required: true,
      },
      'intermediary.routingOrder': {
        required: true,
        default_value: '1',
      },
      'signer.email': {
        required: true,
      },
      'signer.name': {
        required: true,
      },
      'signer.recipientId': {
        required: true,
      },
      'signer.routingOrder': {
        required: true,
        default_value: '1',
      },
      'witness.email': {
        required: true,
      },
      'witness.name': {
        required: true,
      },
      'witness.recipientId': {
        required: true,
      },
      'witness.routingOrder': {
        required: true,
        default_value: '1',
      },
    },
    rest: {
      url: 'https://{{base_uri}}/restapi/v2.1/accounts/{{account_id}}',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_client_id: 'a7aaad55-1fc1-4a14-90cd-d4a27cb84d32',
      oauth2_client_secret: actionsCatalogue.getOauth2ClientSecret(ESIGNATURE_APP_NAME),
      oauth2_auth_url: 'https://account-d.docusign.com/oauth/auth',
      oauth2_token_url: 'https://account-d.docusign.com/oauth/token',
      oauth2_scopes: ['impersonation', 'signature'],
      ping_method: 'GET',
      ping_path: '',
    },
    rest_modifiers: {
      options: ESIGNATURE_CONN_OPTIONS,
      set_options_post_auth: async (context) => {
        // We need to make a call to the docusign user info endpoint to get the base_uri
        // and account_id
        const { data: userInfo }: { data: IEsignatureUserInfo } = await QorusRequest.get(
          {
            path: '/oauth/userinfo',
            headers: {
              Authorization: `Bearer ${context.conn_opts.token}`,
            },
          },
          {
            url: 'https://account-d.docusign.com',
            endpointId: 'Docusign',
          }
        );

        if ('accounts' in userInfo && userInfo.accounts.length > 0) {
          const account = userInfo.accounts.find((account: any) => account.is_default);
          if (!account) {
            throw new Error(`Response missing default account: ${userInfo.accounts}`);
          }
          const base_uri: string = account.base_uri.split('//')[1];
          const account_id: string = account.account_id;

          return {
            base_uri,
            account_id,
            accounts: userInfo.accounts,
          };
        } else {
          throw new Error(`Response missing account info: ${userInfo}`);
        }
      },
      connection_update_option: {
        // the option whose value will be used to return connection values
        option: 'accountId',
        // returns data for url_template_options for the given option
        code: function (context): string | void {
          // find account info in context.conn_opts.accounts
          if (!context.conn_opts.accounts) {
            return;
          }

          const info: IEsignatureUserInfoAccount = (
            context.conn_opts.accounts as IEsignatureUserInfoAccount[]
          ).find((info) => info.account_id === context.opts.accountId);

          if (info) {
            return `https://${info.base_uri}/restapi/v2.1/accounts/${info.account_id}`;
          }
        },
      },
      url_template_options: ['account_id', 'base_uri'],
    },
  }) satisfies IQoreAppWithActions<typeof ESIGNATURE_CONN_OPTIONS>;
