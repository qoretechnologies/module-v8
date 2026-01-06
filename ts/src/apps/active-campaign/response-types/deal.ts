import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';
import { OwnerType } from './common';

const DealLinksType = {
  type: 'hash',
  fields: {
    dealActivities: { type: 'string' },
    contact: { type: 'string' },
    contactDeals: { type: 'string' },
    group: { type: 'string' },
    nextTask: { type: 'string' },
    notes: { type: 'string' },
    account: { type: 'string' },
    customerAccount: { type: 'string' },
    organization: { type: 'string' },
    owner: { type: 'string' },
    scoreValues: { type: 'string' },
    stage: { type: 'string' },
    tasks: { type: 'string' },
    dealCustomFieldData: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const DealResponseType = {
  type: 'hash',
  fields: {
    owner: { type: 'string' },
    contact: { type: 'string' },
    organization: { type: 'string' },
    group: { type: 'string' },
    stage: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    percent: { type: 'string' },
    cdate: { type: 'string' },
    mdate: { type: 'string' },
    nextdate: { type: 'string' },
    nexttaskid: { type: 'string' },
    value: { type: 'string' },
    currency: { type: 'string' },
    winProbability: { type: 'number' },
    winProbabilityMdate: { type: 'string' },
    status: { type: 'string' },
    activitycount: { type: 'string' },
    nextdealid: { type: 'string' },
    edate: { type: 'string' },
    links: { type: DealLinksType },
    id: { type: 'string' },
    isDisabled: { type: 'bool' },
    account: { type: 'string' },
    customerAccount: { type: 'string' },
  },
} satisfies TQoreResponseType;

const DealNoteLinksType = {
  type: 'hash',
  fields: {
    activities: { type: 'string' },
    user: { type: 'string' },
    notes: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const DealNoteResponseType = {
  type: 'hash',
  fields: {
    note: { type: 'string' },
    relid: { type: 'string' },
    reltype: { type: 'string' },
    userid: { type: 'string' },
    cdate: { type: 'string' },
    mdate: { type: 'string' },
    links: { type: DealNoteLinksType },
    id: { type: 'string' },
    owner: { type: OwnerType },
  },
} satisfies TQoreResponseType;

const DealListItemLinksType = {
  type: 'hash',
  fields: {
    dealActivities: { type: 'string' },
    contact: { type: 'string' },
    contactDeals: { type: 'string' },
    group: { type: 'string' },
    nextTask: { type: 'string' },
    notes: { type: 'string' },
    account: { type: 'string' },
    customerAccount: { type: 'string' },
    organization: { type: 'string' },
    owner: { type: 'string' },
    scoreValues: { type: 'string' },
    stage: { type: 'string' },
    tasks: { type: 'string' },
    dealCustomFieldData: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const DealListItemResponseType = {
  type: 'hash',
  fields: {
    hash: { type: 'string' },
    owner: { type: 'string' },
    contact: { type: 'string' },
    organization: { type: 'string' },
    group: { type: 'string' },
    stage: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    percent: { type: 'string' },
    cdate: { type: 'string' },
    mdate: { type: 'string' },
    nextdate: { type: 'string' },
    nexttaskid: { type: 'string' },
    value: { type: 'string' },
    currency: { type: 'string' },
    winProbability: { type: 'number' },
    winProbabilityMdate: { type: 'string' },
    status: { type: 'string' },
    activitycount: { type: 'string' },
    nextdealid: { type: 'string' },
    edate: { type: 'string' },
    links: { type: DealListItemLinksType },
    id: { type: 'string' },
    isDisabled: { type: 'bool' },
    nextTask: { type: 'string' },
    account: { type: 'string' },
    customerAccount: { type: 'string' },
  },
} satisfies TQoreResponseType;

const CreateUpdateDealLinksType = {
  type: 'hash',
  fields: {
    dealActivities: { type: 'string' },
    contact: { type: 'string' },
    contactDeals: { type: 'string' },
    group: { type: 'string' },
    nextTask: { type: 'string' },
    notes: { type: 'string' },
    account: { type: 'string' },
    customerAccount: { type: 'string' },
    organization: { type: 'string' },
    owner: { type: 'string' },
    scoreValues: { type: 'string' },
    stage: { type: 'string' },
    tasks: { type: 'string' },
    dealCustomFieldData: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const CreateUpdateDealResponseType = {
  type: 'hash',
  fields: {
    description: { type: 'string' },
    currency: { type: 'string' },
    percent: { type: 'string' },
    status: { type: 'number' },
    title: { type: 'string' },
    value: { type: 'number' },
    organization: { type: 'number' },
    contact: { type: 'number' },
    group: { type: 'string' },
    owner: { type: 'string' },
    stage: { type: 'string' },
    cdate: { type: 'string' },
    mdate: { type: 'string' },
    nextdate: { type: 'string' },
    hash: { type: 'string' },
    winProbability: { type: 'string' },
    winProbabilityMdate: { type: 'string' },
    links: { type: CreateUpdateDealLinksType },
    fields: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            customFieldId: { type: 'number' },
            fieldValue: { type: 'string' },
            dealId: { type: 'string' },
            fieldCurrency: { type: 'string' },
          },
        },
      },
    },
    id: { type: 'string' },
    isDisabled: { type: 'bool' },
    account: { type: 'number' },
    customerAccount: { type: 'number' },
  },
} satisfies TQoreResponseType;
