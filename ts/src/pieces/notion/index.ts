import { createCustomApiCallAction } from 'core/common';
import {
  OAuth2AuthorizationMethod,
  OAuth2PropertyValue,
  PieceAuth,
  createPiece,
} from 'core/framework';
import { PieceCategory } from 'core/shared';
import { appendToPage } from './lib/actions/append-to-page';
import { createDatabaseItem } from './lib/actions/create-database-item';
import { createPage } from './lib/actions/create-page';
import { updateDatabaseItem } from './lib/actions/update-database-item';
import { findDatabaseItem } from './lib/actions/find-item';
import { getPageOrBlockChildren } from './lib/actions/get-page-or-block-children';
import { addCommentToDiscussion } from './lib/actions/add-comment-to-discussion';
import { addCommentToPage } from './lib/actions/add-comment-to-page';
import { getComments } from './lib/actions/get-comments';
import { getCurrentUser } from './lib/actions/get-current-user';
import { getDatabase } from './lib/actions/get-database';
import { getUser } from './lib/actions/get-user';
import { getUsers } from './lib/actions/get-users';
import { removePage } from './lib/actions/remove-page';
import { createDatabase } from './lib/actions/create-database';
import { newDatabaseItem, updatedDatabaseItem } from './lib/triggers';

export const notionAuth = PieceAuth.OAuth2({
  authUrl: 'https://api.notion.com/v1/oauth/authorize',
  tokenUrl: 'https://api.notion.com/v1/oauth/token',
  scope: ['read', 'write'],
  extra: {
    owner: 'user',
  },
  pingHeaders: {
    'Notion-Version': '2022-02-22',
  },
  oauth2TokenUseBasicAuth: true,
  url: 'https://api.notion.com',
  pingMethod: 'GET',
  pingPath: '/v1/users/me',
  authorizationMethod: OAuth2AuthorizationMethod.HEADER,
  required: true,
});

export const notion = createPiece({
  displayName: 'Notion',
  description: 'The all-in-one workspace',
  logoUrl: 'https://cdn.activepieces.com/pieces/notion.png',
  logo:
    'PHN2ZyB3aWR0aD0iMTI3IiBoZWlnaHQ9IjEyNyIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3Ln' +
    'czLm9yZy8yMDAwL3N2ZyI+CiAgPHBhdGggZD0iTTYuMDE3IDQuMzEzbDU1LjMzMyAtNC4wODdjNi43OTcgLTAuNTgzIDguNTQzIC0wLjE5IDEy' +
    'LjgxNyAyLjkxN2wxNy42NjMgMTIuNDQzYzIuOTEzIDIuMTQgMy44ODMgMi43MjMgMy44ODMgNS4wNTN2NjguMjQzYzAgNC4yNzcgLTEuNTUzID' +
    'YuODA3IC02Ljk5IDcuMTkzTDI0LjQ2NyA5OS45NjdjLTQuMDggMC4xOTMgLTYuMDIzIC0wLjM5IC04LjE2IC0zLjExM0wzLjMgNzkuOTRjLTIu' +
    'MzMzIC0zLjExMyAtMy4zIC01LjQ0MyAtMy4zIC04LjE2N1YxMS4xMTNjMCAtMy40OTcgMS41NTMgLTYuNDEzIDYuMDE3IC02Ljh6IiBmaWxsPS' +
    'IjZmZmIi8+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik02MS4zNSAwLjIyN2wtNTUuMzMzIDQ' +
    'uMDg3QzEuNTUzIDQuNyAwIDcuNjE3IDAgMTEuMTEzdjYwLjY2YzAgMi43MjMgMC45NjcgNS4wNTMgMy4zIDguMTY3bDEzLjAwNyAxNi45MTNjM' +
    'i4xMzcgMi43MjMgNC4wOCAzLjMwNyA4LjE2IDMuMTEzbDY0LjI1NyAtMy44OWM1LjQzMyAtMC4zODcgNi45OSAtMi45MTcgNi45OSAtNy4xOTN' +
    'WMjAuNjRjMCAtMi4yMSAtMC44NzMgLTIuODQ3IC0zLjQ0MyAtNC43MzNMNzQuMTY3IDMuMTQzYy00LjI3MyAtMy4xMDcgLTYuMDIgLTMuNSAt' +
    'MTIuODE3IC0yLjkxN3pNMjUuOTIgMTkuNTIzYy01LjI0NyAwLjM1MyAtNi40MzcgMC40MzMgLTkuNDE3IC0xLjk5TDguOTI3IDExLjUwN2MtM' +
    'C43NyAtMC43OCAtMC4zODMgLTEuNzUzIDEuNTU3IC0xLjk0N2w1My4xOTMgLTMuODg3YzQuNDY3IC0wLjM5IDYuNzkzIDEuMTY3IDguNTQgMi' +
    '41MjdsOS4xMjMgNi42MWMwLjM5IDAuMTk3IDEuMzYgMS4zNiAwLjE5MyAxLjM2bC01NC45MzMgMy4zMDcgLTAuNjggMC4wNDd6TTE5LjgwMyA' +
    '4OC4zVjMwLjM2N2MwIC0yLjUzIDAuNzc3IC0zLjY5NyAzLjEwMyAtMy44OTNMODYgMjIuNzhjMi4xNCAtMC4xOTMgMy4xMDcgMS4xNjcgMy4x' +
    'MDcgMy42OTN2NTcuNTQ3YzAgMi41MyAtMC4zOSA0LjY3IC0zLjg4MyA0Ljg2M2wtNjAuMzc3IDMuNWMtMy40OTMgMC4xOTMgLTUuMDQzIC0wL' +
    'jk3IC01LjA0MyAtNC4wODN6bTU5LjYgLTU0LjgyN2MwLjM4NyAxLjc1IDAgMy41IC0xLjc1IDMuN2wtMi45MSAwLjU3N3Y0Mi43NzNjLTIuNT' +
    'I3IDEuMzYgLTQuODUzIDIuMTM3IC02Ljc5NyAyLjEzNyAtMy4xMDcgMCAtMy44ODMgLTAuOTczIC02LjIxIC0zLjg4N2wtMTkuMDMgLTI5Ljk' +
    '0djI4Ljk2N2w2LjAyIDEuMzYzczAgMy41IC00Ljg1NyAzLjVsLTEzLjM5IDAuNzc3Yy0wLjM5IC0wLjc4IDAgLTIuNzIzIDEuMzU3IC0zLjEx' +
    'bDMuNDk3IC0wLjk3di0zOC4zTDMwLjQ4IDQwLjY2N2MtMC4zOSAtMS43NSAwLjU4IC00LjI3NyAzLjMgLTQuNDczbDE0LjM2NyAtMC45NjcgM' +
    'TkuOCAzMC4zMjd2LTI2LjgzbC01LjA0NyAtMC41OGMtMC4zOSAtMi4xNDMgMS4xNjMgLTMuNyAzLjEwMyAtMy44OWwxMy40IC0wLjc4eiIgZm' +
    'lsbD0iIzAwMCIvPgo8L3N2Zz4K',
  categories: [PieceCategory.PRODUCTIVITY],
  minimumSupportedRelease: '0.5.0',
  authors: ['ShayPunter', 'kishanprmr', 'MoShizzle', 'khaledmashaly', 'abuaboud', 'AdamSelene'],
  auth: notionAuth,
  actions: [
    createDatabaseItem,
    updateDatabaseItem,
    findDatabaseItem,
    createPage,
    appendToPage,
    getPageOrBlockChildren,
    addCommentToDiscussion,
    addCommentToPage,
    getComments,
    getCurrentUser,
    getDatabase,
    getUser,
    getUsers,
    removePage,
    createDatabase,
    createCustomApiCallAction({
      baseUrl: () => 'https://api.notion.com/v1',
      auth: notionAuth,
      authMapping: async (auth) => ({
        Authorization: `Bearer ${(auth as OAuth2PropertyValue).access_token}`,
      }),
    }),
  ],
  triggers: [],
  qoreTriggers: [newDatabaseItem, updatedDatabaseItem],
});
