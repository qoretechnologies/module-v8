import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

/**
 * File object type
 */
const SlackFileType = {
  type: 'hash',
  fields: {
    id: {
      type: 'string',
      short_desc: 'Unique file identifier',
    },
    name: {
      type: 'string',
      short_desc: 'File name',
    },
    title: {
      type: 'string',
      short_desc: 'File title',
    },
    mimetype: {
      type: 'string',
      short_desc: 'MIME type of the file',
    },
    filetype: {
      type: 'string',
      short_desc: 'File type extension',
    },
    pretty_type: {
      type: 'string',
      short_desc: 'Human-readable file type',
    },
    user: {
      type: 'string',
      short_desc: 'User ID who uploaded the file',
    },
    size: {
      type: 'integer',
      short_desc: 'File size in bytes',
    },
    url_private: {
      type: 'string',
      short_desc: 'Private URL to the file',
    },
    url_private_download: {
      type: 'string',
      short_desc: 'Private download URL',
    },
    permalink: {
      type: 'string',
      short_desc: 'Permanent link to the file',
    },
    permalink_public: {
      type: 'string',
      short_desc: 'Public permanent link',
    },
    created: {
      type: 'integer',
      short_desc: 'Unix timestamp when the file was created',
    },
    timestamp: {
      type: 'integer',
      short_desc: 'Unix timestamp',
    },
    channels: {
      type: 'list',
      short_desc: 'Channels where the file is shared',
    },
  },
} satisfies TQoreResponseType;

/**
 * Upload file response type
 */
export const SlackUploadFileResponseType = {
  type: 'hash',
  fields: {
    ok: {
      type: 'bool',
      short_desc: 'Indicates if the file was uploaded successfully',
    },
    files: {
      type: {
        type: 'list',
        element_type: SlackFileType,
      },
      short_desc: 'Uploaded files',
    },
  },
} satisfies TQoreResponseType;

/**
 * TypeScript type for Slack file
 */
export type TSlackFile = {
  id: string;
  name: string;
  title?: string;
  mimetype?: string;
  filetype?: string;
  user?: string;
  size?: number;
  url_private?: string;
  permalink?: string;
  created?: number;
};
