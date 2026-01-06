import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

/**
 * Dropbox file metadata response type
 */
export const DropboxFileMetadataResponseType = {
  type: 'hash',
  fields: {
    '.tag': {
      type: 'string',
      short_desc: 'Entry type (file)',
    },
    name: {
      type: 'string',
      short_desc: 'Name of the file',
    },
    id: {
      type: 'string',
      short_desc: 'Unique identifier for the file',
    },
    path_lower: {
      type: 'string',
      short_desc: 'Lowercased full path in the user Dropbox',
    },
    path_display: {
      type: 'string',
      short_desc: 'Display path with original casing',
    },
    client_modified: {
      type: 'string',
      short_desc: 'Last modified time set by client (ISO 8601)',
    },
    server_modified: {
      type: 'string',
      short_desc: 'Last modified time on Dropbox servers (ISO 8601)',
    },
    rev: {
      type: 'string',
      short_desc: 'Unique identifier for the current revision',
    },
    size: {
      type: 'integer',
      short_desc: 'File size in bytes',
    },
    is_downloadable: {
      type: 'bool',
      short_desc: 'Whether the file can be downloaded',
    },
    content_hash: {
      type: 'string',
      short_desc: 'Hash of the file contents for comparison',
    },
  },
} satisfies TQoreResponseType;

/**
 * TypeScript type for Dropbox file metadata
 */
export type TDropboxFileMetadata = {
  '.tag': 'file';
  name: string;
  id: string;
  path_lower: string;
  path_display: string;
  client_modified: string;
  server_modified: string;
  rev: string;
  size: number;
  is_downloadable: boolean;
  content_hash: string;
};
