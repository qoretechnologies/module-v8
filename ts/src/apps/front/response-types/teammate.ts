import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const FrontTeammateResponseType = {
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
