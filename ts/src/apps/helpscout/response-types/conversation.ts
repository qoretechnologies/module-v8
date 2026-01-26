import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

const userType = {
  type: 'hash',
  fields: {
    id: { type: 'integer' },
    type: { type: 'string' },
    first: { type: 'string' },
    last: { type: 'string' },
    email: { type: 'string' },
    photoUrl: { type: 'string' },
  },
} satisfies TQoreResponseType;

const customerType = {
  type: 'hash',
  fields: {
    id: { type: 'integer' },
    type: { type: 'string' },
    first: { type: 'string' },
    last: { type: 'string' },
    email: { type: 'string' },
  },
} satisfies TQoreResponseType;

const customerWaitingSinceType = {
  type: 'hash',
  fields: {
    time: { type: 'string' },
    friendly: { type: 'string' },
  },
} satisfies TQoreResponseType;

const sourceType = {
  type: 'hash',
  fields: {
    type: { type: 'string' },
    via: { type: 'string' },
  },
} satisfies TQoreResponseType;

const tagType = {
  type: 'hash',
  fields: {
    id: { type: 'integer' },
    color: { type: 'string' },
    tag: { type: 'string' },
  },
} satisfies TQoreResponseType;

const snoozeType = {
  type: 'hash',
  fields: {
    snoozedBy: { type: 'integer' },
    snoozedUntil: { type: 'string' },
    unsnoozeOnCustomerReply: { type: 'bool' },
  },
} satisfies TQoreResponseType;

const nextEventType = {
  type: 'hash',
  fields: {
    time: { type: 'string' },
    eventType: { type: 'string' },
    userId: { type: 'integer' },
    cancelOnCustomerReply: { type: 'bool' },
  },
} satisfies TQoreResponseType;

const customFieldType = {
  type: 'hash',
  fields: {
    id: { type: 'integer' },
    name: { type: 'string' },
    value: { type: 'string' },
    text: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const HelpScoutConversationResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'integer' },
    number: { type: 'integer' },
    threads: { type: 'integer' },
    type: { type: 'string' },
    folderId: { type: 'integer' },
    status: { type: 'string' },
    state: { type: 'string' },
    subject: { type: 'string' },
    preview: { type: 'string' },
    mailboxId: { type: 'integer' },
    assignee: { type: userType },
    createdBy: { type: customerType },
    createdAt: { type: 'string' },
    closedBy: { type: 'integer' },
    closedByUser: { type: userType },
    closedAt: { type: 'string' },
    userUpdatedAt: { type: 'string' },
    customerWaitingSince: { type: customerWaitingSinceType },
    source: { type: sourceType },
    tags: {
      type: {
        type: 'list',
        element_type: tagType,
      },
    },
    cc: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    bcc: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    primaryCustomer: { type: customerType },
    snooze: { type: snoozeType },
    nextEvent: { type: nextEventType },
    customFields: {
      type: {
        type: 'list',
        element_type: customFieldType,
      },
    },
  },
} satisfies TQoreResponseType;

export const HelpScoutThreadResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'integer' },
    type: { type: 'string' },
    status: { type: 'string' },
    state: { type: 'string' },
    action: {
      type: {
        type: 'hash',
        fields: {
          type: { type: 'string' },
          text: { type: 'string' },
        },
      },
    },
    body: { type: 'string' },
    source: { type: sourceType },
    createdBy: { type: userType },
    assignedTo: { type: userType },
    savedReplyId: { type: 'integer' },
    to: { type: { type: 'list', element_type: 'string' } },
    cc: { type: { type: 'list', element_type: 'string' } },
    bcc: { type: { type: 'list', element_type: 'string' } },
    createdAt: { type: 'string' },
    openedAt: { type: 'string' },
  },
} satisfies TQoreResponseType;
