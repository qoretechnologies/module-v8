import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const SurveyMonkeyDeleteResponseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    deleted_id: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const SurveyMonkeyResponseCountsResponseType = {
  type: 'hash',
  fields: {
    survey_id: { type: 'string' },
    total_responses: { type: 'integer' },
  },
} satisfies TQoreResponseType;
