import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

/**
 * Dropbox folder metadata response type
 */
export const DropboxFolderMetadataResponseType = {
  type: 'hash',
  fields: {
    '.tag': {
      type: 'string',
      short_desc: 'Entry type (folder)',
    },
    name: {
      type: 'string',
      short_desc: 'Name of the folder',
    },
    id: {
      type: 'string',
      short_desc: 'Unique identifier for the folder',
    },
    path_lower: {
      type: 'string',
      short_desc: 'Lowercased full path in the user Dropbox',
    },
    path_display: {
      type: 'string',
      short_desc: 'Display path with original casing',
    },
  },
} satisfies TQoreResponseType;

/**
 * Dropbox folder metadata wrapped in metadata object (from create_folder_v2)
 */
export const DropboxFolderMetadataWrappedResponseType = {
  type: 'hash',
  fields: {
    metadata: { type: DropboxFolderMetadataResponseType },
  },
} satisfies TQoreResponseType;

/**
 * TypeScript type for Dropbox folder metadata
 */
export type TDropboxFolderMetadata = {
  '.tag': 'folder';
  name: string;
  id: string;
  path_lower: string;
  path_display: string;
};

/**
 * TypeScript type for wrapped folder metadata
 */
export type TDropboxFolderMetadataWrapped = {
  metadata: TDropboxFolderMetadata;
};
