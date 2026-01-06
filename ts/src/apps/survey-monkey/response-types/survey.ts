import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

const SurveyMonkeyPageResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    position: { type: 'integer' },
  },
} satisfies TQoreResponseType;

export const SurveyMonkeyBasicSurveyResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    title: { type: 'string' },
    nickname: { type: 'string' },
    href: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const SurveyMonkeySurveyResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    title: { type: 'string' },
    nickname: { type: 'string' },
    status: { type: 'string' },
    created_at: { type: 'string' },
    modified_at: { type: 'string' },
    pages: { type: { type: 'list', element_type: SurveyMonkeyPageResponseType } },
    href: { type: 'string' },
  },
} satisfies TQoreResponseType;
