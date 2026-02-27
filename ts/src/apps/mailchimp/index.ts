import {
  QorusRequest,
  TQoreAppWithActions,
  TQoreMappedOptions,
  TQoreRecordBasedApp,
} from '@qoretechnologies/ts-toolkit';
import { createSwaggerPaths, mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import {
  MAILCHIMP_ACTIONS,
  MAILCHIMP_ALLOWED_PATHS,
  MAILCHIMP_APP_LOGO,
  MAILCHIMP_APP_NAME,
  MAILCHIMP_CONN_OPTIONS,
  MailchimpError,
} from './constants';
import {
  createMailchimpRecords,
  deleteMailchimpRecords,
  getMailchimpExpressions,
  getMailchimpRecordType,
  getMailchimpTableList,
  MailchimpSearchOptions,
  searchMailchimpRecords,
  updateMailchimpRecords,
  upsertMailchimpRecords,
} from './helpers/record-based';

import * as MAILCHIMP_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: MAILCHIMP_APP_NAME,
    display_name: L[locale].apps[MAILCHIMP_APP_NAME].displayName(),
    short_desc: L[locale].apps[MAILCHIMP_APP_NAME].shortDesc(),
    desc: L[locale].apps[MAILCHIMP_APP_NAME].longDesc(),
    logo: MAILCHIMP_APP_LOGO,
    logo_file_name: 'mailchimp-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(MAILCHIMP_APP_NAME, MAILCHIMP_ACTIONS, locale),
      ...mapTriggersToApp(MAILCHIMP_APP_NAME, MAILCHIMP_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://{{datacenter}}.api.mailchimp.com/3.0',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://login.mailchimp.com/oauth2/authorize',
      oauth2_token_url: 'https://login.mailchimp.com/oauth2/token',
      ping_path: '/3.0/ping',
      ping_method: 'GET',
    },
    swagger: 'schemas/mailchimp.swagger.json',
    swagger_options: {
      parse_flags: -1,
    },
    swagger_paths: createSwaggerPaths(MAILCHIMP_ALLOWED_PATHS),
    rest_modifiers: {
      options: MAILCHIMP_CONN_OPTIONS,
      url_template_options: ['datacenter'],
      set_options_post_auth: async (
        context
      ): Promise<TQoreMappedOptions<typeof MAILCHIMP_CONN_OPTIONS>> => {
        const token = context.conn_opts?.token;
        if (!token) throw new MailchimpError('Token has to be set to get the datacenter');
        try {
          const response = await QorusRequest.get<{ data: { dc: string } }>(
            { path: '/oauth2/metadata', headers: { Authorization: `Bearer ${token}` } },
            {
              url: 'https://login.mailchimp.com',
              endpointId: 'mailchimp',
            }
          );
          const datacenter = response?.data?.dc;

          if (!datacenter) {
            throw new MailchimpError('Datacenter not found in response');
          }

          return { datacenter, url: `https://${datacenter}.api.mailchimp.com/3.0` };
        } catch (error) {
          throw new MailchimpError(`Error while getting datacenter: ${error}`);
        }
      },
    },

    // Record-based support: audiences as tables, members as records
    get_table_list: getMailchimpTableList,
    expressions: getMailchimpExpressions(locale),
    get_record_type: getMailchimpRecordType,
    search_records: searchMailchimpRecords,
    search_options: MailchimpSearchOptions,
    create_records: createMailchimpRecords,
    update_records: updateMailchimpRecords,
    delete_records: deleteMailchimpRecords,
    upsert_records: upsertMailchimpRecords,
  }) satisfies TQoreRecordBasedApp & TQoreAppWithActions;
