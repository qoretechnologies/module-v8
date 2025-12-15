import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const SendGridBounceResponseType = {
  type: 'hash',
  fields: {
    email: { type: 'string' },
    reason: { type: 'string' },
    status: { type: 'string' },
    created: { type: 'integer' },
  },
} satisfies TQoreResponseType;
