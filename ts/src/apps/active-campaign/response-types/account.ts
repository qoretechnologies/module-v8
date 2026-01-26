import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const AccountResponseType = {
  type: 'hash',
  fields: {
    name: { type: 'string' },
    accountUrl: { type: 'string' },
    createdTimestamp: { type: 'string' },
    updatedTimestamp: { type: 'string' },
    links: {
      type: {
        type: 'list',
        element_type: { type: 'string' },
      },
    },
    id: { type: 'string' },
  },
} satisfies TQoreResponseType;

const AccountListItemLinksType = {
  type: 'hash',
  fields: {
    notes: { type: 'string' },
    accountContacts: { type: 'string' },
    accountCustomFieldMeta: { type: 'string' },
    accountCustomFieldData: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const AccountListItemResponseType = {
  type: 'hash',
  fields: {
    name: { type: 'string' },
    accountUrl: { type: 'string' },
    createdTimestamp: { type: 'string' },
    updatedTimestamp: { type: 'string' },
    links: { type: AccountListItemLinksType },
    fields: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            customFieldId: { type: 'number' },
            fieldValue: { type: 'string' },
            accountId: { type: 'string' },
            createdTimestamp: { type: 'string' },
            updatedTimestamp: { type: 'string' },
            links: {
              type: {
                type: 'hash',
                fields: {
                  owner: { type: 'string' },
                  field: { type: 'string' },
                },
              },
            },
            id: { type: 'string' },
            owner: { type: 'string' },
          },
        },
      },
    },
    contactCount: { type: 'number' },
    dealCount: { type: 'number' },
    id: { type: 'string' },
  },
} satisfies TQoreResponseType;

const AccountContactLinksType = {
  type: 'hash',
  fields: {
    account: { type: 'string' },
    contact: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const AccountContactResponseType = {
  type: 'hash',
  fields: {
    account: { type: 'number' },
    contact: { type: 'number' },
    jobTitle: { type: 'string' },
    createdTimestamp: { type: 'string' },
    updatedTimestamp: { type: 'string' },
    links: { type: AccountContactLinksType },
    id: { type: 'string' },
  },
} satisfies TQoreResponseType;
