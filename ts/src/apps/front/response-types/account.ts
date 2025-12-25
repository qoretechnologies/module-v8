import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const FrontAccountResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    domains: { type: { type: 'list', element_type: 'string' } },
    external_id: { type: 'string' },
    custom_fields: { type: 'any' },
    created_at: { type: 'float' },
    updated_at: { type: 'float' },
  },
} satisfies TQoreResponseType;
