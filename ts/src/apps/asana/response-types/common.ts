import { TQoreTypeObject } from '@qoretechnologies/ts-toolkit';

// Basic resource reference type (from webhook payload)
export const asanaResourceRefType = {
  type: 'hash',
  fields: {
    gid: { type: 'string' },
    resource_type: { type: 'string' },
    resource_subtype: { type: 'string' },
  },
} satisfies TQoreTypeObject;

// Resource reference with name (some webhook resources include name)
export const asanaResourceRefWithNameType = {
  type: 'hash',
  fields: {
    gid: { type: 'string' },
    resource_type: { type: 'string' },
    name: { type: 'string' },
    resource_subtype: { type: 'string' },
  },
} satisfies TQoreTypeObject;

// User reference type (from webhook payload)
export const asanaUserRefType = {
  type: 'hash',
  fields: {
    gid: { type: 'string' },
    resource_type: { type: 'string' },
  },
} satisfies TQoreTypeObject;

// Change type (for update events)
export const asanaChangeType = {
  type: 'hash',
  fields: {
    field: { type: 'string' },
    action: { type: 'string' },
  },
} satisfies TQoreTypeObject;

// Enriched User type (full user data from API)
export const asanaEnrichedUserType = {
  type: 'hash',
  fields: {
    gid: { type: 'string' },
    resource_type: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
  },
} satisfies TQoreTypeObject;

// Enriched Task type
export const asanaEnrichedTaskType = {
  type: 'hash',
  fields: {
    gid: { type: 'string' },
    resource_type: { type: 'string' },
    name: { type: 'string' },
    notes: { type: 'string' },
    due_on: { type: 'string' },
    due_at: { type: 'string' },
    completed: { type: 'bool' },
    completed_at: { type: 'string' },
    assignee: { type: asanaEnrichedUserType },
    resource_subtype: { type: 'string' },
  },
} satisfies TQoreTypeObject;

// Enriched Project type
export const asanaEnrichedProjectType = {
  type: 'hash',
  fields: {
    gid: { type: 'string' },
    resource_type: { type: 'string' },
    name: { type: 'string' },
    notes: { type: 'string' },
    color: { type: 'string' },
    archived: { type: 'bool' },
  },
} satisfies TQoreTypeObject;

// Enriched Story/Comment type
export const asanaEnrichedStoryType = {
  type: 'hash',
  fields: {
    gid: { type: 'string' },
    resource_type: { type: 'string' },
    text: { type: 'string' },
    type: { type: 'string' },
    resource_subtype: { type: 'string' },
    created_at: { type: 'string' },
  },
} satisfies TQoreTypeObject;

// Enriched Tag type
export const asanaEnrichedTagType = {
  type: 'hash',
  fields: {
    gid: { type: 'string' },
    resource_type: { type: 'string' },
    name: { type: 'string' },
    color: { type: 'string' },
  },
} satisfies TQoreTypeObject;

// Enriched Attachment type
export const asanaEnrichedAttachmentType = {
  type: 'hash',
  fields: {
    gid: { type: 'string' },
    resource_type: { type: 'string' },
    name: { type: 'string' },
    download_url: { type: 'string' },
    view_url: { type: 'string' },
    host: { type: 'string' },
  },
} satisfies TQoreTypeObject;

// Enriched Team type
export const asanaEnrichedTeamType = {
  type: 'hash',
  fields: {
    gid: { type: 'string' },
    resource_type: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
  },
} satisfies TQoreTypeObject;

// Enriched Workspace type
export const asanaEnrichedWorkspaceType = {
  type: 'hash',
  fields: {
    gid: { type: 'string' },
    resource_type: { type: 'string' },
    name: { type: 'string' },
  },
} satisfies TQoreTypeObject;

// Enriched Section type
export const asanaEnrichedSectionType = {
  type: 'hash',
  fields: {
    gid: { type: 'string' },
    resource_type: { type: 'string' },
    name: { type: 'string' },
  },
} satisfies TQoreTypeObject;
