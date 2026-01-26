import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

/**
 * Search match metadata type
 */
const SearchMatchMetadataType = {
  type: 'hash',
  fields: {
    '.tag': {
      type: 'string',
      short_desc: 'Metadata type (metadata)',
    },
    metadata: {
      type: 'any',
      short_desc: 'File or folder metadata',
    },
  },
} satisfies TQoreResponseType;

/**
 * Search match type
 */
const SearchMatchType = {
  type: 'hash',
  fields: {
    match_type: {
      type: 'any',
      short_desc: 'How the result was matched',
    },
    metadata: { type: SearchMatchMetadataType },
  },
} satisfies TQoreResponseType;

/**
 * Dropbox search result response type
 */
export const DropboxSearchResultResponseType = {
  type: 'hash',
  fields: {
    has_more: {
      type: 'bool',
      short_desc: 'Whether there are more results',
    },
    cursor: {
      type: 'string',
      short_desc: 'Cursor for fetching more results',
    },
    matches: {
      type: {
        type: 'list',
        element_type: SearchMatchType,
      },
      short_desc: 'List of search matches',
    },
  },
} satisfies TQoreResponseType;

/**
 * TypeScript type for search match
 */
export type TDropboxSearchMatch = {
  match_type: {
    '.tag': 'filename' | 'content' | 'filename_and_content' | 'image_content';
  };
  metadata: {
    '.tag': 'metadata';
    metadata: {
      '.tag': 'file' | 'folder';
      name: string;
      path_lower: string;
      path_display: string;
      id: string;
      [key: string]: any;
    };
  };
};

/**
 * TypeScript type for search result
 */
export type TDropboxSearchResult = {
  has_more: boolean;
  cursor?: string;
  matches: TDropboxSearchMatch[];
};
