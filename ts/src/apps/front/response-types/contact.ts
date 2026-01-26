import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

const FrontContactHandleResponseType = {
  type: 'hash',
  fields: {
    handle: { type: 'string' },
    source: { type: 'string' },
  },
} satisfies TQoreResponseType;

const FrontContactGroupResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    name: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const FrontContactResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    avatar_url: { type: 'string' },
    is_spammer: { type: 'bool' },
    links: { type: { type: 'list', element_type: 'string' } },
    handles: { type: { type: 'list', element_type: FrontContactHandleResponseType } },
    groups: { type: { type: 'list', element_type: FrontContactGroupResponseType } },
    custom_fields: { type: 'any' },
    is_private: { type: 'bool' },
    created_at: { type: 'float' },
    updated_at: { type: 'float' },
  },
} satisfies TQoreResponseType;
