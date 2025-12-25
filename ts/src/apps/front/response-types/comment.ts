import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

const FrontCommentAuthorResponseType = {
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

export const FrontCommentResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    body: { type: 'string' },
    posted_at: { type: 'float' },
    is_pinned: { type: 'bool' },
    author: { type: FrontCommentAuthorResponseType },
  },
} satisfies TQoreResponseType;
