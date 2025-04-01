import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const NetsuiteBaseObjectCreationResponseType = {
  type: 'hash',
  fields: {
    id: {
      type: 'string',
    },
  },
} satisfies TQoreResponseType;
