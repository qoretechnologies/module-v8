import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const SurveyMonkeySurveyFolderResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    title: { type: 'string' },
    href: { type: 'string' },
  },
} satisfies TQoreResponseType;
