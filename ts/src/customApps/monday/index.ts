import { QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { MONDAY_APP_NAME } from './constants';
import * as MondayActions from './actions';
const actions = Object.values(MondayActions);

const MondayApp = QoreAppCreator.createApp({
  name: MONDAY_APP_NAME,
  display_name: 'Monday',
  desc: 'Monday.com is a cloud-based Work Operating System (Work OS).',
  short_desc:
    'Enables teams to build custom workflows and applications to manage' +
    'projects, processes, and everyday tasks efficiently.',

  actions: [...actions],

  logo:
    `PHN2ZyBoZWlnaHQ9IjE1NDkiIHZpZXdCb3g9Ii0xLjY2IC00LjEwMjA0OTMyID` +
    `I0My4wNSAxNDcuNTEyMDQ5MzIiIHdpZHRoPSIyNTAwIiB4bWxucz0iaHR0cDov` +
    `L3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Im0xMjAuMjQgMTQzLjE2Yy` +
    `D0xMC42My0uMjYtMTkuNC00Ljk1LTI1LTE0Ljc0LTUuNzQtMTAuMTItNS40OS0` +
    `yMC40OC42My0zMC4zNSAxNC41Ny0yMy40OSAyOS4zMy00Ni44NSA0NC03MC4yN` +
    `yAzLTQuNzkgNS45My05LjY1IDkuMDctMTQuMzVhMjkuNCAyOS40IDAgMCAxIDQ` +
    `wLTkuMDljMTMuODEgOC41MSAxOC40MyAyNi4yMSA5LjgzIDQwLjE2cS0yNi4zN` +
    `yA0Mi45NS01My40OSA4NS40OGMtNS41NyA4Ljc3LTE0LjAyIDEzLTI1LjA0IDE` +
    `zLjE2eiIgZmlsbD0iI2ZmY2IwMCIvPjxwYXRoIGQ9Im0yOC45NCAxNDMuMTZj` +
    `LTEwLjczLS4yNi0xOS40NS01LjE2LTI0Ljk0LTE0LjkxLTUuNjYtMTAuMTItNS` +
    `4zLTIwLjUuODQtMzAuMzdxMjMuNTEtMzcuNzIgNDcuMjMtNzUuMzNjMi0zLjI0` +
    `IDQtNi41NiA2LjE0LTkuN2EyOS40MSAyOS40MSAwIDAgMSA0OS40MSAzMS44Nm` +
    `MtMTcuNTIgMjguMjktMzUuMjggNTYuNDgtNTMuMDUgODQuNjQtNS43NyA5LjEz` +
    `LTE0LjI2IDEzLjY1LTI1LjYzIDEzLjgxeiIgZmlsbD0iI2ZmM2Q1NyIvPjxwYX` +
    `RoIGQ9Im0yMTIuMTMgODUuODJjMTYuMTcuMDggMjkuMjYgMTIuOTMgMjkuMjMg` +
    `MjguNjkgMCAxNi0xMy40NCAyOC45LTI5Ljc2IDI4LjdzLTI5LjE4LTEyLjkxLT` +
    `I5LjE2LTI4Ljc0Yy4wMi0xNi4wNiAxMy4xNi0yOC43NSAyOS42OS0yOC42NXoi` +
    `IGZpbGw9IiMwMGQ2NDciLz48L3N2Zz4=`,
  logo_file_name: 'monday.svg',
  logo_mime_type: 'image/svg+xml',
  rest: {
    data: 'json',
    url: 'https://api.monday.com',
    oauth2_grant_type: 'authorization_code',
    oauth2_auth_url: 'https://auth.monday.com/oauth2/authorize',
    oauth2_token_url: 'https://auth.monday.com/oauth2/token',
    ping_method: 'GET',
    ping_path: '',
    oauth2_scopes: [
      'me:read',
      'boards:read',
      'boards:write',
      'docs:read',
      'docs:write',
      'workspaces:read',
      'workspaces:write',
      'users:read',
      'users:write',
      'account:read',
      'notifications:write',
      'updates:read',
      'updates:write',
      'assets:read',
      'tags:read',
      'teams:read',
      'webhooks:write',
      'webhooks:read',
    ],
  },
});

export default MondayApp;
