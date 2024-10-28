import { actionsCatalogue } from '../../ActionsCatalogue';
import { buildActionsFromSwaggerSchema, mapActionsToApp } from '../../global/helpers';
import { IQoreAppWithActions } from '../../global/models/qore';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import stripe from '../../schemas/stripe.swagger.json';
import { STRIPE_ALLOWED_PATHS, STRIPE_APP_NAME } from './constants';

export const STRIPE_ACTIONS = buildActionsFromSwaggerSchema(stripe as any, STRIPE_ALLOWED_PATHS);

/*
 * Returns the app object with all the actions ready to use, using translations
 * @param locale - the locale
 * @returns IQoreAppWithActions
 */
export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[STRIPE_APP_NAME].displayName(),
    short_desc: L[locale].apps[STRIPE_APP_NAME].shortDesc(),
    name: STRIPE_APP_NAME,
    actions: mapActionsToApp(STRIPE_APP_NAME, STRIPE_ACTIONS, locale),
    desc: L[locale].apps[STRIPE_APP_NAME].longDesc(),
    logo:
      'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3' +
      'JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPgo8c3ZnIHdpZHRoPSIxMjciIGhlaWdodD0iMTI3' +
      'IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICA8Y2lyY2xlIG' +
      'N4PSI1MTIiIGN5PSI1MTIiIHI9IjUxMiIgc3R5bGU9ImZpbGw6IzYzNWJmZiIvPgogICA8cGF0aCBkPSJNNzgxLjY3IDUxNS43' +
      'NWMwLTM4LjM1LTE4LjU4LTY4LjYyLTU0LjA4LTY4LjYycy01Ny4yMyAzMC4yNi01Ny4yMyA2OC4zMmMwIDQ1LjA5IDI1LjQ3ID' +
      'Y3Ljg3IDYyIDY3Ljg3IDE3LjgzIDAgMzEuMzEtNCA0MS41LTkuNzR2LTMwYy0xMC4xOSA1LjA5LTIxLjg3IDguMjQtMzYuNyA4' +
      'LjI0LTE0LjUzIDAtMjcuNDItNS4wOS0yOS4wNi0yMi43N2g3My4yNmMuMDEtMS45Mi4zMS05LjcxLjMxLTEzLjN6bS03NC0xNC' +
      '4yM2MwLTE2LjkzIDEwLjM0LTI0IDE5Ljc4LTI0IDkuMTQgMCAxOC44OCA3IDE4Ljg4IDI0em0tOTUuMTQtNTQuMzlhNDIuMzIg' +
      'NDIuMzIgMCAwIDAtMjkuMzYgMTEuNjlsLTEuOTUtOS4yOWgtMzN2MTc0LjY4bDM3LjQ1LTcuOTQuMTUtNDIuNGM1LjM5IDMuOS' +
      'AxMy4zMyA5LjQ0IDI2LjUyIDkuNDQgMjYuODIgMCA1MS4yNC0yMS41NyA1MS4yNC02OS4wNi0uMTItNDMuNDUtMjQuODQtNjcu' +
      'MTItNTEuMDUtNjcuMTJ6bS05IDEwMy4yMmMtOC44NCAwLTE0LjA4LTMuMTUtMTcuNjgtN2wtLjE1LTU1LjU4YzMuOS00LjM0ID' +
      'kuMjktNy4zNCAxNy44My03LjM0IDEzLjYzIDAgMjMuMDcgMTUuMjggMjMuMDcgMzQuOTEuMDEgMjAuMDMtOS4yOCAzNS4wMS0y' +
      'My4wNiAzNS4wMXpNNDk2LjcyIDQzOC4yOWwzNy42LTguMDl2LTMwLjQxbC0zNy42IDcuOTR2MzAuNTZ6bTAgMTEuMzloMzcuNn' +
      'YxMzEuMDloLTM3LjZ6bS00MC4zIDExLjA4TDQ1NCA0NDkuNjhoLTMyLjM0djEzMS4wOGgzNy40NXYtODguODRjOC44NC0xMS41' +
      'NCAyMy44Mi05LjQ0IDI4LjQ2LTcuNzl2LTM0LjQ1Yy00Ljc4LTEuOC0yMi4zMS01LjEtMzEuMTUgMTEuMDh6bS03NC45MS00My' +
      '41OUwzNDUgNDI1bC0uMTUgMTIwYzAgMjIuMTcgMTYuNjMgMzguNSAzOC44IDM4LjUgMTIuMjggMCAyMS4yNy0yLjI1IDI2LjIy' +
      'LTQuOTR2LTMwLjQ1Yy00Ljc5IDEuOTUtMjguNDYgOC44NC0yOC40Ni0xMy4zM3YtNTMuMTloMjguNDZ2LTMxLjkxaC0yOC41MX' +
      'ptLTEwMS4yNyA3MC41NmMwLTUuODQgNC43OS04LjA5IDEyLjczLTguMDlhODMuNTYgODMuNTYgMCAwIDEgMzcuMTUgOS41OVY0' +
      'NTRhOTguOCA5OC44IDAgMCAwLTM3LjEyLTYuODdjLTMwLjQxIDAtNTAuNjQgMTUuODgtNTAuNjQgNDIuNCAwIDQxLjM1IDU2Lj' +
      'kzIDM0Ljc2IDU2LjkzIDUyLjU4IDAgNi44OS02IDkuMTQtMTQuMzggOS4xNC0xMi40MyAwLTI4LjMyLTUuMDktNDAuOS0xMnYz' +
      'NS42NmExMDMuODUgMTAzLjg1IDAgMCAwIDQwLjkgOC41NGMzMS4xNiAwIDUyLjU4LTE1LjQzIDUyLjU4LTQyLjI1LS4xNy00NC' +
      '42My01Ny4yNS0zNi42OS01Ny4yNS01My40N3oiIHN0eWxlPSJmaWxsOiNmZmYiLz4KPC9zdmc+',
    logo_file_name: 'stripe-logo.svg',
    logo_mime_type: 'image/svg+xml',
    swagger: 'schemas/stripe.swagger.json',
    swagger_options: {
      parse_flags: -1,
    },
    swagger_paths: STRIPE_ALLOWED_PATHS,
    rest: {
      url: 'https://api.stripe.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_client_id: '1208416840087775',
      oauth2_client_secret: actionsCatalogue.getOauth2ClientSecret(STRIPE_APP_NAME),
      oauth2_auth_url: 'https://connect.stripe.com/oauth/authorize',
      oauth2_token_url: 'https://connect.stripe.com/oauth/token',
      oauth2_scopes: ['read_write'],
      ping_method: 'GET',
      ping_path: '/v1/accounts',
    },
  }) satisfies IQoreAppWithActions;
