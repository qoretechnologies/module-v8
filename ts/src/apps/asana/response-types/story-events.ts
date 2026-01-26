import { TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import {
  asanaResourceRefType,
  asanaResourceRefWithNameType,
  asanaUserRefType,
  asanaEnrichedUserType,
  asanaEnrichedTaskType,
  asanaEnrichedStoryType,
} from './common';

// Story/Comment event type (for new-task-story, new-task-comment)
export const asanaStoryEventInfoType = {
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
          resource: { type: asanaEnrichedStoryType },
          parent: { type: asanaEnrichedTaskType },
          user: { type: asanaEnrichedUserType },
        },
      },
    },
  },
} satisfies TQoreTypeObject;
