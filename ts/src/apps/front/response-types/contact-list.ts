import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const FrontContactListResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    created_at: { type: 'float' },
    updated_at: { type: 'float' },
  },
} satisfies TQoreResponseType;
