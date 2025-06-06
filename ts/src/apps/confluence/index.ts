import {
  QorusRequest,
  TQoreAppWithActions,
  TQoreMappedOptions,
} from '@qoretechnologies/ts-toolkit';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { CONFLUENCE_ACTIONS } from './allowed-paths';
import { CONFLUENCE_APP_LOGO, CONFLUENCE_APP_NAME, CONFLUENCE_CONN_OPTIONS } from './constants';
import * as CONFLUENCE_TRIGGERS from './triggers';

export default (locale: Locales) =>
  ({
    name: CONFLUENCE_APP_NAME,
    display_name: L[locale].apps[CONFLUENCE_APP_NAME].displayName(),
    short_desc: L[locale].apps[CONFLUENCE_APP_NAME].shortDesc(),
    desc: L[locale].apps[CONFLUENCE_APP_NAME].longDesc(),
    logo: CONFLUENCE_APP_LOGO,
    logo_file_name: 'confluence-logo.svg',
    logo_mime_type: 'image/svg+xml',
    actions: [
      ...mapActionsToApp(CONFLUENCE_APP_NAME, CONFLUENCE_ACTIONS, locale),
      ...mapTriggersToApp(CONFLUENCE_APP_NAME, CONFLUENCE_TRIGGERS, locale),
    ],
    rest: {
      url: 'https://api.atlassian.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_scopes: [
        'offline_access',
        'read:page:confluence',
        'write:page:confluence',
        'delete:page:confluence',
        'read:blogpost:confluence',
        'write:blogpost:confluence',
        'delete:blogpost:confluence',
        'read:space:confluence',
        'write:space:confluence',
        'delete:space:confluence',
        'read:task:confluence',
        'write:task:confluence',
        'read:label:confluence',
        'write:label:confluence',
        'read:confluence-space.summary',
        'write:confluence-content',
      ],
      oauth2_auth_url: 'https://auth.atlassian.com/authorize',
      oauth2_token_url: 'https://auth.atlassian.com/oauth/token',
      ping_method: 'GET',
      ping_path: '/oauth/token/accessible-resources',
    },
    swagger_options: {
      parse_flags: -1,
    },
    swagger: 'schemas/confluence.swagger.json',
    rest_modifiers: {
      options: CONFLUENCE_CONN_OPTIONS,
      set_options_post_auth: async (
        context
      ): Promise<TQoreMappedOptions<typeof CONFLUENCE_CONN_OPTIONS>> => {
        const token = context?.conn_opts?.token;

        if (!token) {
          throw new Error('The token is required to set confluence options post auth');
        }

        try {
          const userAccounts = await QorusRequest.get<Record<string, any>>(
            {
              path: '/oauth/token/accessible-resources',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
            {
              url: 'https://api.atlassian.com',
              endpointId: 'Atlassian',
            }
          );
          const userInfo = userAccounts?.data[0];

          if (!userInfo?.id) {
            throw new Error('The user account id was not found');
          }

          const cloud_id = userInfo.id;

          return {
            cloud_id,
            swagger_base_path: `/ex/confluence/${cloud_id}/wiki/api/v2`,
          };
        } catch (error) {
          console.error(error);
          throw error;
        }
      },
    },
  }) satisfies TQoreAppWithActions;
