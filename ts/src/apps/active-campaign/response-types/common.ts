import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const PaginationPageInputType = {
  type: 'hash',
  fields: {
    segmentid: { type: 'number' },
    formid: { type: 'number' },
    listid: { type: 'number' },
    tagid: { type: 'number' },
    limit: { type: 'number' },
    offset: { type: 'number' },
    search: { type: 'string' },
    sort: { type: 'string' },
    seriesid: { type: 'number' },
    status: { type: 'number' },
  },
} satisfies TQoreResponseType;

export const MetaResponseType = {
  type: 'hash',
  fields: {
    total: { type: 'string' },
    page_input: { type: PaginationPageInputType },
  },
} satisfies TQoreResponseType;

export const OwnerType = {
  type: 'hash',
  fields: {
    type: { type: 'string' },
    id: { type: 'string' },
  },
} satisfies TQoreResponseType;
