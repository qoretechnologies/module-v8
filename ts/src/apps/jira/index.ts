import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { actionsCatalogue } from '../../ActionsCatalogue';
import { buildActionsFromSwaggerSchema, mapActionsToApp } from '../../global/helpers';
import { IQoreAppWithActions } from '../../global/models/qore';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import jira from '../../schemas/jira.swagger.json';
import { JIRA_ALLOWED_PATHS, JIRA_APP_NAME, JIRA_CONN_OPTIONS } from './constants';
import { createSwaggerPaths } from '../../global/helpers/index';

export const JIRA_ACTIONS = buildActionsFromSwaggerSchema(jira as any, JIRA_ALLOWED_PATHS);

/*
 * Returns the app object with all the actions ready to use, using translations
 * @param locale - the locale
 * @returns IQoreAppWithActions
 */
export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[JIRA_APP_NAME].displayName(),
    short_desc: L[locale].apps[JIRA_APP_NAME].shortDesc(),
    name: JIRA_APP_NAME,
    actions: mapActionsToApp(JIRA_APP_NAME, JIRA_ACTIONS, locale),
    desc: L[locale].apps[JIRA_APP_NAME].longDesc(),
    logo:
      'PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCIgd2lkdGg9IjEyNyIgaGVpZ2h0PSIxMjciIHhtbG5zPSJodHRwO' +
      'i8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3' +
      'g9IjAgLTMwLjYzMjM4ODUxNjUxMDIzMyAyNTUuMzI0IDI4NS45NTYzODg1MTY1MTAyMyI+PGxpbmVhckdyYWRpZW50IGlkPSJ' +
      'hIj48c3RvcCBvZmZzZXQ9Ii4xOCIgc3RvcC1jb2xvcj0iIzAwNTJjYyIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0i' +
      'IzI2ODRmZiIvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJiIiB4MT0iOTguMDMxJSIgeDI9IjU4Ljg4O' +
      'CUiIHhsaW5rOmhyZWY9IiNhIiB5MT0iLjE2MSUiIHkyPSI0MC43NjYlIi8+PGxpbmVhckdyYWRpZW50IGlkPSJjIiB4MT0iMT' +
      'AwLjY2NSUiIHgyPSI1NS40MDIlIiB4bGluazpocmVmPSIjYSIgeTE9Ii40NTUlIiB5Mj0iNDQuNzI3JSIvPjxwYXRoIGQ9Ik0' +
      'yNDQuNjU4IDBIMTIxLjcwN2E1NS41MDIgNTUuNTAyIDAgMCAwIDU1LjUwMiA1NS41MDJoMjIuNjQ5Vjc3LjM3Yy4wMiAzMC42' +
      'MjUgMjQuODQxIDU1LjQ0NyA1NS40NjYgNTUuNDY3VjEwLjY2NkMyNTUuMzI0IDQuNzc3IDI1MC41NSAwIDI0NC42NTggMHoiI' +
      'GZpbGw9IiMyNjg0ZmYiLz48cGF0aCBkPSJNMTgzLjgyMiA2MS4yNjJINjAuODcyYy4wMTkgMzAuNjI1IDI0Ljg0IDU1LjQ0Ny' +
      'A1NS40NjYgNTUuNDY3aDIyLjY0OXYyMS45MzhjLjAzOSAzMC42MjUgMjQuODc3IDU1LjQzIDU1LjUwMiA1NS40M1Y3MS45M2M' +
      'wLTUuODkxLTQuNzc2LTEwLjY2Ny0xMC42NjctMTAuNjY3eiIgZmlsbD0idXJsKCNiKSIvPjxwYXRoIGQ9Ik0xMjIuOTUxIDEy' +
      'Mi40ODlIMGMwIDMwLjY1MyAyNC44NSA1NS41MDIgNTUuNTAyIDU1LjUwMmgyMi43MnYyMS44NjdjLjAyIDMwLjU5NyAyNC43O' +
      'TggNTUuNDA4IDU1LjM5NiA1NS40NjZWMTMzLjE1NmMwLTUuODkxLTQuNzc2LTEwLjY2Ny0xMC42NjctMTAuNjY3eiIgZmlsbD' +
      '0idXJsKCNjKSIvPjwvc3ZnPg==',
    logo_file_name: 'jira-logo.svg',
    logo_mime_type: 'image/svg+xml',
    swagger: 'schemas/jira.swagger.json',
    swagger_paths: createSwaggerPaths(JIRA_ALLOWED_PATHS),
    swagger_options: {
      parse_flags: -1,
    },
    rest: {
      url: 'https://api.atlassian.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_client_id: 'kmvUW6HHUljPnUfYqeRfy1c1AWcE3IqY',
      oauth2_client_secret: actionsCatalogue.getOauth2ClientSecret(JIRA_APP_NAME),
      oauth2_auth_url: 'https://auth.atlassian.com/authorize',
      oauth2_token_url: 'https://auth.atlassian.com/oauth/token',
      oauth2_auth_args: {
        audience: 'api.atlassian.com',
      },
      oauth2_scopes: [
        'read:jira-user',
        'read:jira-work',
        'write:jira-work',
        'manage:jira-project',
        'manage:jira-configuration',
        'manage:jira-data-provider',
        'manage:jira-webhook',
        'read:me',
        'read:account',
        'read:servicedesk-request',
        'manage:servicedesk-customer',
        'write:servicedesk-request',
        'read:servicemanagement-insight-objects',
      ],
      ping_method: 'GET',
      ping_path: '/rest/api/3/myself',
    },
    rest_modifiers: {
      options: JIRA_CONN_OPTIONS,
      set_options_post_auth: async (context) => {
        try {
          const userAccounts = await QorusRequest.get<Record<string, any>>(
            {
              path: '/oauth/token/accessible-resources',
              headers: {
                Authorization: `Bearer ${context.conn_opts.token}`,
              },
            },
            {
              url: 'https://api.atlassian.com',
              endpointId: 'Atlassian',
            }
          );
          const userInfo = userAccounts.data[0];
          if ('id' in userInfo) {
            const cloud_id = userInfo.id;

            return {
              cloud_id,
              ping_path: `/ex/jira/${cloud_id}/rest/api/3/myself`,
              swagger_base_path: `/ex/jira/${cloud_id}`,
            };
          }
        } catch (error) {
          console.error(error);
          throw error;
        }
      },
      url_template_options: ['cloud_id'],
    },
  }) satisfies IQoreAppWithActions;
