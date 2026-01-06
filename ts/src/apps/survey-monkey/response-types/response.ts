import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const SurveyMonkeyBasicResponseResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    status: { type: 'string' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    email_address: { type: 'string' },
    date_created: { type: 'string' },
    date_modified: { type: 'string' },
    href: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const SurveyMonkeyDetailedResponseResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    status: { type: 'string' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    email_address: { type: 'string' },
    date_created: { type: 'string' },
    date_modified: { type: 'string' },
    pages: { type: 'any' }, // Complex nested structure with questions and answers
    href: { type: 'string' },
  },
} satisfies TQoreResponseType;
