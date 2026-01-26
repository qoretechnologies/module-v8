import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

const FrontMessageAuthorResponseType = {
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

const FrontMessageRecipientResponseType = {
  type: 'hash',
  fields: {
    handle: { type: 'string' },
    name: { type: 'string' },
    role: { type: 'string' },
  },
} satisfies TQoreResponseType;

const FrontMessageAttachmentResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    filename: { type: 'string' },
    url: { type: 'string' },
    content_type: { type: 'string' },
    size: { type: 'integer' },
    is_inline: { type: 'bool' },
  },
} satisfies TQoreResponseType;

const FrontMessageMetadataResponseType = {
  type: 'hash',
  fields: {
    external_id: { type: 'string' },
    chat_visitor_url: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const FrontMessageResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    message_uid: { type: 'string' },
    type: { type: 'string' },
    is_inbound: { type: 'bool' },
    is_draft: { type: 'bool' },
    blurb: { type: 'string' },
    body: { type: 'string' },
    text: { type: 'string' },
    subject: { type: 'string' },
    created_at: { type: 'float' },
    author: { type: FrontMessageAuthorResponseType },
    recipients: { type: { type: 'list', element_type: FrontMessageRecipientResponseType } },
    attachments: { type: { type: 'list', element_type: FrontMessageAttachmentResponseType } },
    metadata: { type: FrontMessageMetadataResponseType },
  },
} satisfies TQoreResponseType;
