import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

const TagLinksType = {
  type: 'hash',
  fields: {
    contactGoalTags: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const TagResponseType = {
  type: 'hash',
  fields: {
    tagType: { type: 'string' },
    tag: { type: 'string' },
    description: { type: 'string' },
    cdate: { type: 'string' },
    links: { type: TagLinksType },
    id: { type: 'string' },
  },
} satisfies TQoreResponseType;
