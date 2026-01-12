import { TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import {
  asanaResourceRefType,
  asanaResourceRefWithNameType,
  asanaUserRefType,
  asanaEnrichedUserType,
  asanaEnrichedWorkspaceType,
} from './common';

// User added event type (for new-user)
export const asanaUserEventInfoType = {
  type: 'hash',
  fields: {
    action: { type: 'string' },
    type: { type: 'string' },
    created_at: { type: 'string' },
    parent: { type: asanaResourceRefType },
    resource: { type: asanaResourceRefWithNameType },
    user: { type: asanaUserRefType },
    enriched: {
      type: {
        type: 'hash',
        fields: {
          resource: { type: asanaEnrichedUserType },
          parent: { type: asanaEnrichedWorkspaceType },
          user: { type: asanaEnrichedUserType },
        },
      },
    },
  },
} satisfies TQoreTypeObject;
