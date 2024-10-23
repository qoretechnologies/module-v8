import { actionsCatalogue } from '../../ActionsCatalogue';
import { buildActionsFromSwaggerSchema, mapActionsToApp } from '../../global/helpers';
import { IQoreAppWithActions } from '../../global/models/qore';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import github from '../../schemas/github.swagger.json';

export const GITHUB_APP_NAME = 'Github';
export const GITHUB_ALLOWED_PATHS = [
  '/repos/{owner}/{repo}/pulls',
  '/repos/{owner}/{repo}/pulls/{pull_number}',
  '/repos/{owner}/{repo}/issues',
  '/repos/{owner}/{repo}/issues/{issue_number}',
  '/repos/{owner}/{repo}/commits',
  '/repos/{owner}/{repo}/branches',
  '/repos/{owner}/{repo}/releases',
  '/repos/{owner}/{repo}/contributors',
  '/orgs/{org}/members',
  '/orgs/{org}/repos',
  '/repos/{owner}/{repo}',
  '/repos/{owner}/{repo}/contents/{path}',
  '/issues',
  '/user/repos',
  '/search/repositories',
  '/search/issues',
  '/repos/{owner}/{repo}/collaborators',
  '/repos/{owner}/{repo}/actions/workflows',
  '/repos/{owner}/{repo}/issues/{issue_number}/assignees',
  '/repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers',
  '/repos/{owner}/{repo}/git/refs',
  '/repos/{owner}/{repo}/branches/{branch}',
  '/repos/{owner}/{repo}/actions/secrets/{secret_name}',
  '/repos/{owner}/{repo}/actions/secrets/public-key',
];
export const GITHUB_ACTIONS = buildActionsFromSwaggerSchema(github as any, GITHUB_ALLOWED_PATHS);

/*
 * Returns the app object with all the actions ready to use, using translations
 * @param locale - the locale
 * @returns IQoreAppWithActions
 */
export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[GITHUB_APP_NAME].displayName(),
    short_desc: L[locale].apps[GITHUB_APP_NAME].shortDesc(),
    name: GITHUB_APP_NAME,
    desc: L[locale].apps[GITHUB_APP_NAME].longDesc(),
    actions: mapActionsToApp(GITHUB_APP_NAME, GITHUB_ACTIONS, locale),
    logo: 'PHN2ZyB3aWR0aD0iOTgiIGhlaWdodD0iOTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik00OC44NTQgMEMyMS44MzkgMCAwIDIyIDAgNDkuMjE3YzAgMjEuNzU2IDEzLjk5MyA0MC4xNzIgMzMuNDA1IDQ2LjY5IDIuNDI3LjQ5IDMuMzE2LTEuMDU5IDMuMzE2LTIuMzYyIDAtMS4xNDEtLjA4LTUuMDUyLS4wOC05LjEyNy0xMy41OSAyLjkzNC0xNi40Mi01Ljg2Ny0xNi40Mi01Ljg2Ny0yLjE4NC01LjcwNC01LjQyLTcuMTctNS40Mi03LjE3LTQuNDQ4LTMuMDE1LjMyNC0zLjAxNS4zMjQtMy4wMTUgNC45MzQuMzI2IDcuNTIzIDUuMDUyIDcuNTIzIDUuMDUyIDQuMzY3IDcuNDk2IDExLjQwNCA1LjM3OCAxNC4yMzUgNC4wNzQuNDA0LTMuMTc4IDEuNjk5LTUuMzc4IDMuMDc0LTYuNi0xMC44MzktMS4xNDEtMjIuMjQzLTUuMzc4LTIyLjI0My0yNC4yODMgMC01LjM3OCAxLjk0LTkuNzc4IDUuMDE0LTEzLjItLjQ4NS0xLjIyMi0yLjE4NC02LjI3NS40ODYtMTMuMDM4IDAgMCA0LjEyNS0xLjMwNCAxMy40MjYgNS4wNTJhNDYuOTcgNDYuOTcgMCAwIDEgMTIuMjE0LTEuNjNjNC4xMjUgMCA4LjMzLjU3MSAxMi4yMTMgMS42MyA5LjMwMi02LjM1NiAxMy40MjctNS4wNTIgMTMuNDI3LTUuMDUyIDIuNjcgNi43NjMuOTcgMTEuODE2LjQ4NSAxMy4wMzggMy4xNTUgMy40MjIgNS4wMTUgNy44MjIgNS4wMTUgMTMuMiAwIDE4LjkwNS0xMS40MDQgMjMuMDYtMjIuMzI0IDI0LjI4MyAxLjc4IDEuNTQ4IDMuMzE2IDQuNDgxIDMuMzE2IDkuMTI2IDAgNi42LS4wOCAxMS44OTctLjA4IDEzLjUyNiAwIDEuMzA0Ljg5IDIuODUzIDMuMzE2IDIuMzY0IDE5LjQxMi02LjUyIDMzLjQwNS0yNC45MzUgMzMuNDA1LTQ2LjY5MUM5Ny43MDcgMjIgNzUuNzg4IDAgNDguODU0IDB6IiBmaWxsPSIjMjQyOTJmIi8+PC9zdmc+',
    logo_file_name: 'github-logo.svg',
    logo_mime_type: 'image/svg+xml',
    swagger: 'schemas/github.swagger.json',
    rest: {
      url: 'https://api.github.com/',
      data: 'json',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
      oauth2_grant_type: 'authorization_code',
      oauth2_client_id: 'Ov23liR886f3UxFr2NVK',
      oauth2_client_secret: actionsCatalogue.getOauth2ClientSecret(GITHUB_APP_NAME),
      oauth2_auth_url: 'https://github.com/login/oauth/authorize',
      oauth2_token_url: 'https://github.com/login/oauth/access_token',
      oauth2_scopes: ['repo', 'user'],
      ping_method: 'GET',
      ping_path: '',
    },
  }) satisfies IQoreAppWithActions;
