import { TQoreAppActionOption } from '@qoretechnologies/ts-toolkit';

export const SharepointIdentityQoreType = {
  type: {
    type: 'hash',
    fields: {
      id: {
        type: 'string',
      },
      displayName: {
        type: 'string',
      },
    },
  },
} satisfies TQoreAppActionOption;
