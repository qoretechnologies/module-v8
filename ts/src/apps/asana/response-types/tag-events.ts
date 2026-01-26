import { TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import {
  asanaResourceRefType,
  asanaResourceRefWithNameType,
  asanaUserRefType,
  asanaEnrichedUserType,
  asanaEnrichedTaskType,
  asanaEnrichedTagType,
  asanaEnrichedWorkspaceType,
} from './common';

// Task Tag event type (for new-task-tag)
export const asanaTaskTagEventInfoType = {
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
          resource: { type: asanaEnrichedTagType },
          parent: { type: asanaEnrichedTaskType },
          user: { type: asanaEnrichedUserType },
        },
      },
    },
  },
} satisfies TQoreTypeObject;

// Workspace Tag event type (for new-workspace-tag)
export const asanaWorkspaceTagEventInfoType = {
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
          resource: { type: asanaEnrichedTagType },
          parent: { type: asanaEnrichedWorkspaceType },
          user: { type: asanaEnrichedUserType },
        },
      },
    },
  },
} satisfies TQoreTypeObject;
