import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const ContentfulEntryResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string', short_desc: 'Entry ID' },
    content_type: { type: 'string', short_desc: 'Content type ID' },
    created_at: { type: 'date', short_desc: 'Creation timestamp' },
    updated_at: { type: 'date', short_desc: 'Last update timestamp' },
    version: { type: 'int', short_desc: 'Current version number' },
  },
} satisfies TQoreResponseType;

export const ContentfulEntryListResponseType = {
  type: 'list',
  element_type: ContentfulEntryResponseType,
} satisfies TQoreResponseType;

export const ContentfulPublishResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string', short_desc: 'Entry ID' },
    version: { type: 'int', short_desc: 'Published version number' },
    published_at: { type: 'date', short_desc: 'Publish timestamp' },
  },
} satisfies TQoreResponseType;
