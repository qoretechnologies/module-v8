import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const SendGridListResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'integer' },
    name: { type: 'string' },
    recipient_count: { type: 'integer' },
  },
} satisfies TQoreResponseType;
