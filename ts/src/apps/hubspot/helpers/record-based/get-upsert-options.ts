import { TQoreUpsertOptions } from '@qoretechnologies/ts-toolkit';

export const HubspotUpsertOptions = {
  idProperty: {
    type: 'string',
    required: true,
    desc: 'The unique identifier property name for upsert operations',
  },
} satisfies TQoreUpsertOptions;
