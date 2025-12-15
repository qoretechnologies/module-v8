import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const SendGridGlobalSuppressionResponseType = {
  type: 'hash',
  fields: {
    email: { type: 'string' },
    created: { type: 'integer' },
  },
} satisfies TQoreResponseType;
