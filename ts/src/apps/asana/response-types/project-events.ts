import { TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import {
  asanaResourceRefType,
  asanaResourceRefWithNameType,
  asanaUserRefType,
  asanaEnrichedUserType,
  asanaEnrichedProjectType,
  asanaEnrichedWorkspaceType,
} from './common';

// Project created event type (for new-project)
export const asanaProjectEventInfoType = {
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
          resource: { type: asanaEnrichedProjectType },
          parent: { type: asanaEnrichedWorkspaceType },
          user: { type: asanaEnrichedUserType },
        },
      },
    },
  },
} satisfies TQoreTypeObject;
