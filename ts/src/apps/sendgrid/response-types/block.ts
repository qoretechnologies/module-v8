import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const SendGridBlockResponseType = {
  type: 'hash',
  fields: {
    email: { type: 'string' },
    reason: { type: 'string' },
    created: { type: 'integer' },
  },
} satisfies TQoreResponseType;
