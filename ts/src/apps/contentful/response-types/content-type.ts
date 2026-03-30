import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const ContentfulFieldResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string', short_desc: 'Field ID' },
    name: { type: 'string', short_desc: 'Field name' },
    type: { type: 'string', short_desc: 'Field type (Symbol, Text, Integer, Number, Date, Boolean, etc.)' },
    required: { type: 'bool', short_desc: 'Whether the field is required' },
    localized: { type: 'bool', short_desc: 'Whether the field supports localization' },
  },
} satisfies TQoreResponseType;

export const ContentfulContentTypeResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string', short_desc: 'Content type ID' },
    name: { type: 'string', short_desc: 'Content type name' },
    description: { type: 'string', short_desc: 'Content type description' },
    display_field: { type: 'string', short_desc: 'ID of the field used as display title' },
    fields: { type: { type: 'list', element_type: ContentfulFieldResponseType } },
  },
} satisfies TQoreResponseType;

export const ContentfulContentTypeListResponseType = {
  type: 'list',
  element_type: ContentfulContentTypeResponseType,
} satisfies TQoreResponseType;
