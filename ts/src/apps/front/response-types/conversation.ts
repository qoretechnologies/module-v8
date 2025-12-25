import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

const FrontTeammateResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    email: { type: 'string' },
    username: { type: 'string' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    is_admin: { type: 'bool' },
    is_available: { type: 'bool' },
    is_blocked: { type: 'bool' },
  },
} satisfies TQoreResponseType;

const FrontRecipientResponseType = {
  type: 'hash',
  fields: {
    handle: { type: 'string' },
    role: { type: 'string' },
  },
} satisfies TQoreResponseType;

const FrontTagResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    is_private: { type: 'bool' },
    created_at: { type: 'float' },
    updated_at: { type: 'float' },
  },
} satisfies TQoreResponseType;

const FrontMetadataResponseType = {
  type: 'hash',
  fields: {
    external_conversation_ids: { type: { type: 'list', element_type: 'string' } },
  },
} satisfies TQoreResponseType;

export const FrontConversationResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    subject: { type: 'string' },
    status: { type: 'string' },
    assignee: { type: FrontTeammateResponseType },
    recipient: { type: FrontRecipientResponseType },
    tags: { type: { type: 'list', element_type: FrontTagResponseType } },
    links: { type: { type: 'list', element_type: 'string' } },
    custom_fields: { type: 'any' },
    created_at: { type: 'float' },
    waiting_since: { type: 'float' },
    is_private: { type: 'bool' },
    scheduled_reminders: { type: { type: 'list', element_type: 'any' } },
    metadata: { type: FrontMetadataResponseType },
  },
} satisfies TQoreResponseType;
