import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

const StageLinksType = {
  type: 'hash',
  fields: {
    group: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const StageResponseType = {
  type: 'hash',
  fields: {
    cardRegion1: { type: 'string' },
    cardRegion2: { type: 'string' },
    cardRegion3: { type: 'string' },
    cardRegion4: { type: 'string' },
    cardRegion5: { type: 'string' },
    cdate: { type: 'string' },
    color: { type: 'string' },
    dealOrder: { type: 'string' },
    group: { type: 'string' },
    id: { type: 'string' },
    links: { type: StageLinksType },
    order: { type: 'string' },
    title: { type: 'string' },
    udate: { type: 'string' },
    width: { type: 'string' },
  },
} satisfies TQoreResponseType;
