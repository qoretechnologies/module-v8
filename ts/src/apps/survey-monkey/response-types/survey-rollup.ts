import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const SurveyMonkeySurveyRollupResponseType = {
  type: 'hash',
  fields: {
    survey_id: { type: 'string' },
    response_count: { type: 'integer' },
    page_path: { type: 'string' },
    questions: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            heading: { type: 'string' },
            summary: { type: 'any' },
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;
