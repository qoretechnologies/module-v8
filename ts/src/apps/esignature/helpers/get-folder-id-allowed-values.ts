import { IQoreRestGetAllowedValues } from '../../../global/models/qore';

export const getEsignatureFolderIdAllowedValues = {
  method: 'GET',
  path: 'folders',
  values: 'body.folders.folderId',
  display_names: 'body.folders.name',
  short_descs: 'body.folders.folderId',
} satisfies IQoreRestGetAllowedValues;
