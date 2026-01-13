import { TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import {
  asanaResourceRefType,
  asanaResourceRefWithNameType,
  asanaUserRefType,
  asanaChangeType,
  asanaEnrichedUserType,
  asanaEnrichedTaskType,
  asanaEnrichedSectionType,
} from './common';

// Task moved to section event type (for task-moved-to-section)
export const asanaTaskMovedToSectionEventInfoType = {
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
          parent: { type: asanaEnrichedSectionType },
          user: { type: asanaEnrichedUserType },
        },
      },
    },
  },
} satisfies TQoreTypeObject;
