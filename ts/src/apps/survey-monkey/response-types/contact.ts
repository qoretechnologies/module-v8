import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const SurveyMonkeyContactResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    email: { type: 'string' },
    phone_number: { type: 'string' },
    custom_fields: { type: 'any' },
    href: { type: 'string' },
  },
} satisfies TQoreResponseType;
