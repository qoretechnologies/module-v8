import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

const BaseContactResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    email: { type: 'string' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    phone: { type: 'string' },
    tags: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    orgname: { type: 'string' },
    ip: { type: 'string' },
  },
} satisfies TQoreResponseType;

const ExtendedContactResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    email: { type: 'string' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    phone: { type: 'string' },
    tags: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
    orgname: { type: 'string' },
    ip: { type: 'string' },
    fields: {
      type: {
        type: 'hash',
      },
    },
  },
} satisfies TQoreResponseType;

const FormResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
  },
} satisfies TQoreResponseType;

const CampaignResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
  },
} satisfies TQoreResponseType;

const BounceResponseType = {
  type: 'hash',
  fields: {
    type: { type: 'string' },
    code: { type: 'string' },
    description: { type: 'string' },
  },
} satisfies TQoreResponseType;

const LinkResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    url: { type: 'string' },
  },
} satisfies TQoreResponseType;

const DealResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    title: { type: 'string' },
    create_date: { type: 'string' },
    orgid: { type: 'string' },
    orgname: { type: 'string' },
    stageid: { type: 'string' },
    stage_title: { type: 'string' },
    pipelineid: { type: 'string' },
    pipeline_title: { type: 'string' },
    value: { type: 'string' },
    currency: { type: 'string' },
    currency_symbol: { type: 'string' },
    owner: { type: 'string' },
    owner_firstname: { type: 'string' },
    owner_lastname: { type: 'string' },
    contactid: { type: 'string' },
    contact_email: { type: 'string' },
    contact_firstname: { type: 'string' },
    contact_lastname: { type: 'string' },
    status: { type: 'string' },
  },
} satisfies TQoreResponseType;

const NoteResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    text: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const ContactAddedToListEventResponseType = {
  type: 'hash',
  fields: {
    url: { type: 'string' },
    type: { type: 'string' },
    date_time: { type: 'string' },
    initiated_by: { type: 'string' },
    list: { type: 'number' },
    form: {
      type: FormResponseType,
    },
    contact: {
      type: BaseContactResponseType,
    },
  },
} satisfies TQoreResponseType;

export const ContactUpdatedEventResponseType = {
  type: 'hash',
  fields: {
    url: { type: 'string' },
    type: { type: 'string' },
    date_time: { type: 'string' },
    initiated_by: { type: 'string' },
    list: { type: 'number' },
    contact: {
      type: ExtendedContactResponseType,
    },
  },
} satisfies TQoreResponseType;

export const CampaignBounceEventResponseType = {
  type: 'hash',
  fields: {
    url: { type: 'string' },
    type: { type: 'string' },
    date_time: { type: 'string' },
    initiated_by: { type: 'string' },
    list: { type: 'string' },
    campaign: {
      type: CampaignResponseType,
    },
    bounce: {
      type: BounceResponseType,
    },
    contact: {
      type: ExtendedContactResponseType,
    },
  },
} satisfies TQoreResponseType;

export const CampaignLinkClickEventResponseType = {
  type: 'hash',
  fields: {
    url: { type: 'string' },
    type: { type: 'string' },
    date_time: { type: 'string' },
    initiated_by: { type: 'string' },
    list: { type: 'string' },
    campaign: {
      type: CampaignResponseType,
    },
    link: {
      type: LinkResponseType,
    },
    contact: {
      type: ExtendedContactResponseType,
    },
  },
} satisfies TQoreResponseType;

export const CampaignReplyEventResponseType = {
  type: 'hash',
  fields: {
    url: { type: 'string' },
    type: { type: 'string' },
    date_time: { type: 'string' },
    initiated_by: { type: 'string' },
    list: { type: 'string' },
    campaign: {
      type: CampaignResponseType,
    },
    result: { type: 'string' },
    message: { type: 'string' },
    contact: {
      type: ExtendedContactResponseType,
    },
  },
} satisfies TQoreResponseType;

export const ContactNoteEventResponseType = {
  type: 'hash',
  fields: {
    url: { type: 'string' },
    type: { type: 'string' },
    date_time: { type: 'string' },
    initiated_by: { type: 'string' },
    list: { type: 'string' },
    note: { type: 'string' },
    contact: {
      type: ExtendedContactResponseType,
    },
  },
} satisfies TQoreResponseType;

export const NewContactEventResponseType = {
  type: 'hash',
  fields: {
    url: { type: 'string' },
    type: { type: 'string' },
    date_time: { type: 'string' },
    initiated_by: { type: 'string' },
    list: { type: 'string' },
    form: {
      type: FormResponseType,
    },
    contact: {
      type: BaseContactResponseType,
    },
  },
} satisfies TQoreResponseType;

export const DealNoteEventResponseType = {
  type: 'hash',
  fields: {
    url: { type: 'string' },
    type: { type: 'string' },
    date_time: { type: 'string' },
    initiated_by: { type: 'string' },
    list: { type: 'string' },
    deal: {
      type: DealResponseType,
    },
    note: {
      type: NoteResponseType,
    },
  },
} satisfies TQoreResponseType;

export const NewDealEventResponseType = {
  type: 'hash',
  fields: {
    url: { type: 'string' },
    type: { type: 'string' },
    date_time: { type: 'string' },
    initiated_by: { type: 'string' },
    list: { type: 'string' },
    deal: {
      type: DealResponseType,
    },
    contact: {
      type: BaseContactResponseType,
    },
  },
} satisfies TQoreResponseType;
