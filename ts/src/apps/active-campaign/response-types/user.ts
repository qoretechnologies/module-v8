import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

const UserLinksType = {
  type: 'hash',
  fields: {
    lists: { type: 'string' },
    userGroup: { type: 'string' },
    dealGroupTotals: { type: 'string' },
    dealGroupUsers: { type: 'string' },
    configs: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const UserResponseType = {
  type: 'hash',
  fields: {
    username: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    signature: { type: 'string' },
    links: { type: UserLinksType },
    id: { type: 'string' },
  },
} satisfies TQoreResponseType;
