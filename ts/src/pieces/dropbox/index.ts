import { createCustomApiCallAction } from 'core/common';
import { OAuth2PropertyValue, PieceAuth, createPiece } from 'core/framework';
import { PieceCategory } from 'core/shared';
import { dropboxCopyFile } from './lib/actions/copy-file';
import { dropboxCopyFolder } from './lib/actions/copy-folder';
import { dropboxCreateNewFolder } from './lib/actions/create-new-folder';
import { dropboxCreateNewTextFile } from './lib/actions/create-new-text-file';
import { dropboxDeleteFile } from './lib/actions/delete-file';
import { dropboxDeleteFolder } from './lib/actions/delete-folder';
import { dropboxGetFileLink } from './lib/actions/get-file-link';
import { dropboxListAFolder } from './lib/actions/list-a-folder';
import { dropboxMoveFile } from './lib/actions/move-file';
import { dropboxMoveFolder } from './lib/actions/move-folder';
import { dropboxSearch } from './lib/actions/search';
import { dropboxUploadFile } from './lib/actions/upload-file';

export const dropboxAuth = PieceAuth.OAuth2({
  description: '',
  pingMethod: 'POST',
  pingPath: 'check/user',
  pingBody: { query: 'val' },
  url: 'https://api.dropboxapi.com/2',
  authUrl: 'https://www.dropbox.com/oauth2/authorize',
  tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
  required: true,
  scope: [
    'files.metadata.write',
    'files.metadata.read',
    'files.content.write',
    'files.content.read',
    'account_info.read',
  ],
  extra: {
    token_access_type: 'offline',
  },
});

export const dropbox = createPiece({
  minimumSupportedRelease: '0.5.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/dropbox.png',
  logo:
    'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iODAwIiB3aWR0aD0iMTIwMCIgaWQ9InN2ZzEyNiIgdmVyc2l' +
    'vbj0iMS4xIiB2aWV3Qm94PSItMzUuMzE3NSAtNTAgMzA2LjA4NSAzMDAiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW' +
    '5rIj4KIDxkZWZzIGlkPSJkZWZzMTEyIj4KICA8c3R5bGUgaWQ9InN0eWxlMTEwIj4KICAgLmNscy0xe2ZpbGw6IzAwNjFmZn0KICA8L3N0eWxlP' +
    'gogPC9kZWZzPgogPHBhdGggaWQ9InBvbHlnb24xMTYiIGNsYXNzPSJjbHMtMSIgZD0iTTU4Ljg2IDc1bDU4Ljg3LTM3LjVMNTguODYgMCAwIDM3' +
    'LjV6Ij4KIDwvcGF0aD4KIDxwYXRoIGlkPSJwb2x5Z29uMTE4IiBjbGFzcz0iY2xzLTEiIGQ9Ik0xNzYuNTkgNzVsNTguODYtMzcuNUwxNzYuNTk' +
    'gMGwtNTguODYgMzcuNXoiPgogPC9wYXRoPgogPHBhdGggaWQ9InBvbHlnb24xMjAiIGNsYXNzPSJjbHMtMSIgZD0iTTExNy43MyAxMTIuNUw1OC' +
    '44NiA3NSAwIDExMi41IDU4Ljg2IDE1MHoiPgogPC9wYXRoPgogPHBhdGggaWQ9InBvbHlnb24xMjIiIGNsYXNzPSJjbHMtMSIgZD0iTTE3Ni41O' +
    'SAxNTBsNTguODYtMzcuNUwxNzYuNTkgNzVsLTU4Ljg2IDM3LjV6Ij4KIDwvcGF0aD4KIDxwYXRoIGlkPSJwb2x5Z29uMTI0IiBjbGFzcz0iY2xz' +
    'LTEiIGQ9Ik0xNzYuNTkgMTYyLjVMMTE3LjczIDEyNWwtNTguODcgMzcuNSA1OC44NyAzNy41eiI+CiA8L3BhdGg+Cjwvc3ZnPg==',
  actions: [
    dropboxSearch,
    dropboxCreateNewTextFile,
    dropboxUploadFile,
    dropboxGetFileLink,
    dropboxDeleteFile,
    dropboxMoveFile,
    dropboxCopyFile,
    dropboxCreateNewFolder,
    dropboxDeleteFolder,
    dropboxMoveFolder,
    dropboxCopyFolder,
    dropboxListAFolder,
    createCustomApiCallAction({
      baseUrl: () => 'https://api.dropboxapi.com/2',
      auth: dropboxAuth,
      authMapping: async (auth) => ({
        Authorization: `Bearer ${(auth as OAuth2PropertyValue).access_token}`,
      }),
    }),
  ],
  displayName: 'Dropbox',
  description: 'Cloud storage and file synchronization',
  authors: ['BastienMe', 'kishanprmr', 'MoShizzle', 'khaledmashaly', 'abuaboud'],
  categories: [PieceCategory.CONTENT_AND_FILES],
  triggers: [],
  auth: dropboxAuth,
});
