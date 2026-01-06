import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const SurveyMonkeyBasicCollectorResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    name: { type: 'string' },
    href: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const SurveyMonkeyCollectorResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    survey_id: { type: 'string' },
    type: { type: 'string' },
    name: { type: 'string' },
    status: { type: 'string' },
    url: { type: 'string' },
    created_at: { type: 'string' },
    modified_at: { type: 'string' },
    href: { type: 'string' },
  },
} satisfies TQoreResponseType;
