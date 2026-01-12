import { TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import {
  asanaResourceRefType,
  asanaResourceRefWithNameType,
  asanaUserRefType,
  asanaChangeType,
  asanaEnrichedUserType,
  asanaEnrichedTaskType,
  asanaEnrichedProjectType,
} from './common';

// Task event type (for project_task_added, task_completed)
export const asanaTaskEventInfoType = {
  type: 'hash',
  fields: {
    action: { type: 'string' },
    type: { type: 'string' },
    created_at: { type: 'string' },
    parent: { type: asanaResourceRefType },
    resource: { type: asanaResourceRefWithNameType },
    user: { type: asanaUserRefType },
    change: { type: asanaChangeType },
    enriched: {
      type: {
        type: 'hash',
        fields: {
          resource: { type: asanaEnrichedTaskType },
          parent: { type: asanaEnrichedProjectType },
          user: { type: asanaEnrichedUserType },
        },
      },
    },
  },
} satisfies TQoreTypeObject;
