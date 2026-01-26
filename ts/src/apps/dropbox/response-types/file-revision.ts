import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

/**
 * Dropbox file revision response type
 */
export const DropboxFileRevisionResponseType = {
  type: 'hash',
  fields: {
    name: {
      type: 'string',
      short_desc: 'Name of the file',
    },
    path_lower: {
      type: 'string',
      short_desc: 'Lowercased full path',
    },
    path_display: {
      type: 'string',
      short_desc: 'Display path with original casing',
    },
    id: {
      type: 'string',
      short_desc: 'Unique identifier for the file',
    },
    rev: {
      type: 'string',
      short_desc: 'Revision identifier',
    },
    size: {
      type: 'integer',
      short_desc: 'File size in bytes',
    },
    server_modified: {
      type: 'string',
      short_desc: 'Last modified time on server (ISO 8601)',
    },
    client_modified: {
      type: 'string',
      short_desc: 'Last modified time set by client (ISO 8601)',
    },
    is_deleted: {
      type: 'bool',
      short_desc: 'Whether this revision is a deletion marker',
    },
  },
} satisfies TQoreResponseType;

/**
 * List file revisions response type
 */
export const DropboxListRevisionsResponseType = {
  type: 'hash',
  fields: {
    is_deleted: {
      type: 'bool',
      short_desc: 'Whether the file is currently deleted',
    },
    server_deleted: {
      type: 'string',
      short_desc: 'When the file was deleted (if deleted)',
    },
    entries: {
      type: {
        type: 'list',
        element_type: DropboxFileRevisionResponseType,
      },
      short_desc: 'List of file revisions',
    },
  },
} satisfies TQoreResponseType;

/**
 * TypeScript type for Dropbox file revision
 */
export type TDropboxFileRevision = {
  name: string;
  path_lower: string;
  path_display: string;
  id: string;
  rev: string;
  size: number;
  server_modified: string;
  client_modified: string;
  is_deleted?: boolean;
};
