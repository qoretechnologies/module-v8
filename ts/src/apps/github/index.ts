import { actionsCatalogue } from '../../ActionsCatalogue';
import {
  buildActionsFromSwaggerSchema,
  mapActionsToApp,
  mapTriggersToApp,
} from '../../global/helpers';
import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import github from '../../schemas/github.swagger.json';
import { GITHUB_ALLOWED_PATHS, GITHUB_APP_NAME } from './constants';
import { createSwaggerPaths } from '../../global/helpers/index';
import * as githubTriggers from './triggers';

export const GITHUB_ACTIONS = buildActionsFromSwaggerSchema({
  schema: github as any,
  allowedPaths: GITHUB_ALLOWED_PATHS,
  app: GITHUB_APP_NAME,
});

/*
 * Returns the app object with all the actions ready to use, using translations
 * @param locale - the locale
 * @returns TQoreAppWithActions
 */
export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[GITHUB_APP_NAME].displayName(),
    short_desc: L[locale].apps[GITHUB_APP_NAME].shortDesc(),
    name: GITHUB_APP_NAME,
    desc: L[locale].apps[GITHUB_APP_NAME].longDesc(),
    actions: [
      ...mapActionsToApp(GITHUB_APP_NAME, GITHUB_ACTIONS, locale),
      ...mapTriggersToApp(GITHUB_APP_NAME, githubTriggers, locale),
    ],
    logo:
      'PHN2ZyB3aWR0aD0iOTgiIGhlaWdodD0iOTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yM' +
      'DAwL3N2ZyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik00' +
      'OC44NTQgMEMyMS44MzkgMCAwIDIyIDAgNDkuMjE3YzAgMjEuNzU2IDEzLjk5MyA0MC4xNzIgMzMuNDA' +
      '1IDQ2LjY5IDIuNDI3LjQ5IDMuMzE2LTEuMDU5IDMuMzE2LTIuMzYyIDAtMS4xNDEtLjA4LTUuMDUyLS' +
      '4wOC05LjEyNy0xMy41OSAyLjkzNC0xNi40Mi01Ljg2Ny0xNi40Mi01Ljg2Ny0yLjE4NC01LjcwNC01L' +
      'jQyLTcuMTctNS40Mi03LjE3LTQuNDQ4LTMuMDE1LjMyNC0zLjAxNS4zMjQtMy4wMTUgNC45MzQuMzI2' +
      'IDcuNTIzIDUuMDUyIDcuNTIzIDUuMDUyIDQuMzY3IDcuNDk2IDExLjQwNCA1LjM3OCAxNC4yMzUgNC4' +
      'wNzQuNDA0LTMuMTc4IDEuNjk5LTUuMzc4IDMuMDc0LTYuNi0xMC44MzktMS4xNDEtMjIuMjQzLTUuMz' +
      'c4LTIyLjI0My0yNC4yODMgMC01LjM3OCAxLjk0LTkuNzc4IDUuMDE0LTEzLjItLjQ4NS0xLjIyMi0yL' +
      'jE4NC02LjI3NS40ODYtMTMuMDM4IDAgMCA0LjEyNS0xLjMwNCAxMy40MjYgNS4wNTJhNDYuOTcgNDYu' +
      'OTcgMCAwIDEgMTIuMjE0LTEuNjNjNC4xMjUgMCA4LjMzLjU3MSAxMi4yMTMgMS42MyA5LjMwMi02LjM' +
      '1NiAxMy40MjctNS4wNTIgMTMuNDI3LTUuMDUyIDIuNjcgNi43NjMuOTcgMTEuODE2LjQ4NSAxMy4wMz' +
      'ggMy4xNTUgMy40MjIgNS4wMTUgNy44MjIgNS4wMTUgMTMuMiAwIDE4LjkwNS0xMS40MDQgMjMuMDYtM' +
      'jIuMzI0IDI0LjI4MyAxLjc4IDEuNTQ4IDMuMzE2IDQuNDgxIDMuMzE2IDkuMTI2IDAgNi42LS4wOCAx' +
      'MS44OTctLjA4IDEzLjUyNiAwIDEuMzA0Ljg5IDIuODUzIDMuMzE2IDIuMzY0IDE5LjQxMi02LjUyIDM' +
      'zLjQwNS0yNC45MzUgMzMuNDA1LTQ2LjY5MUM5Ny43MDcgMjIgNzUuNzg4IDAgNDguODU0IDB6IiBmaW' +
      'xsPSIjZmZmIi8+PC9zdmc+',
    logo_file_name: 'github-logo.svg',
    logo_mime_type: 'image/svg+xml',
    swagger: 'schemas/github.swagger.json',
    swagger_paths: createSwaggerPaths(GITHUB_ALLOWED_PATHS),
    rest: {
      url: 'https://api.github.com',
      data: 'json',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
      oauth2_grant_type: 'authorization_code',
      oauth2_client_id: 'Ov23liR886f3UxFr2NVK',
      oauth2_client_secret: actionsCatalogue.getOauth2ClientSecret(GITHUB_APP_NAME),
      oauth2_auth_url: 'https://github.com/login/oauth/authorize',
      oauth2_token_url: 'https://github.com/login/oauth/access_token',
      oauth2_scopes: ['repo', 'user', 'public_repo'],
      ping_method: 'GET',
      ping_path: '/user',
    },
  }) satisfies TQoreAppWithActions;
