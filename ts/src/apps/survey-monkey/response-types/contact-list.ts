import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const SurveyMonkeyContactListResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    name: { type: 'string' },
    href: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const SurveyMonkeyContactListDetailResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    name: { type: 'string' },
    contact_count: { type: 'integer' },
    href: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const SurveyMonkeyBulkContactResponseType = {
  type: 'hash',
  fields: {
    succeeded: {
      type: {
        type: 'list',
        element_type: { type: 'string' },
      },
    },
    failed: {
      type: {
        type: 'list',
        element_type: { type: 'string' },
      },
    },
    existing: {
      type: {
        type: 'list',
        element_type: { type: 'string' },
      },
    },
  },
} satisfies TQoreResponseType;
