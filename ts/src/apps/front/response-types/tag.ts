import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const FrontTagResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    highlight: { type: 'string' },
    is_private: { type: 'bool' },
    is_visible_in_conversation_lists: { type: 'bool' },
    created_at: { type: 'float' },
    updated_at: { type: 'float' },
  },
} satisfies TQoreResponseType;
