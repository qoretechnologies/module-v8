import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

/**
 * Link permissions type
 */
const LinkPermissionsType = {
  type: 'hash',
  fields: {
    can_revoke: {
      type: 'bool',
      short_desc: 'Whether the caller can revoke this shared link',
    },
    resolved_visibility: {
      type: 'any',
      short_desc: 'The current visibility of the link',
    },
    requested_visibility: {
      type: 'any',
      short_desc: 'The requested visibility of the link',
    },
    revoke_failure_reason: {
      type: 'any',
      short_desc: 'Reason the user cannot revoke the link',
    },
  },
} satisfies TQoreResponseType;

/**
 * Dropbox shared link response type
 */
export const DropboxSharedLinkResponseType = {
  type: 'hash',
  fields: {
    '.tag': {
      type: 'string',
      short_desc: 'Link type (file or folder)',
    },
    url: {
      type: 'string',
      short_desc: 'URL of the shared link',
    },
    id: {
      type: 'string',
      short_desc: 'Unique identifier for the linked file/folder',
    },
    name: {
      type: 'string',
      short_desc: 'Name of the linked file/folder',
    },
    path_lower: {
      type: 'string',
      short_desc: 'Lowercased full path',
    },
    link_permissions: { type: LinkPermissionsType },
    expires: {
      type: 'string',
      short_desc: 'Expiration time if set (ISO 8601)',
    },
  },
} satisfies TQoreResponseType;

/**
 * List shared links response type
 */
export const DropboxListSharedLinksResponseType = {
  type: 'hash',
  fields: {
    links: {
      type: {
        type: 'list',
        element_type: DropboxSharedLinkResponseType,
      },
      short_desc: 'List of shared links',
    },
    has_more: {
      type: 'bool',
      short_desc: 'Whether there are more links to fetch',
    },
    cursor: {
      type: 'string',
      short_desc: 'Cursor for fetching more links',
    },
  },
} satisfies TQoreResponseType;

/**
 * TypeScript type for Dropbox shared link
 */
export type TDropboxSharedLink = {
  '.tag': 'file' | 'folder';
  url: string;
  id: string;
  name: string;
  path_lower: string;
  link_permissions: {
    can_revoke: boolean;
    resolved_visibility?: any;
    requested_visibility?: any;
    revoke_failure_reason?: any;
  };
  expires?: string;
};
