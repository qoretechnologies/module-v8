import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const SurveyMonkeyUserResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    username: { type: 'string' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    email: { type: 'string' },
    account_type: { type: 'string' },
    language: { type: 'string' },
    date_created: { type: 'string' },
    date_last_login: { type: 'string' },
    href: { type: 'string' },
  },
} satisfies TQoreResponseType;
