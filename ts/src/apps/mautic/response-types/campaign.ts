import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export type TMauticCampaign = {
  id: number;
  name: string;
  description: string | null;
  isPublished: boolean;
  dateAdded: string;
  dateModified: string;
  createdBy: number;
  createdByUser: string;
  modifiedBy: number;
  modifiedByUser: string;
  publishUp: string | null;
  publishDown: string | null;
  category: {
    id: number;
    title: string;
    alias: string;
    color: string;
  } | null;
};

const MauticCampaignCategoryType = {
  type: 'hash',
  fields: {
    id: { type: 'number' },
    title: { type: 'string' },
    alias: { type: 'string' },
    color: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const MauticCampaignType = {
  type: 'hash',
  fields: {
    id: { type: 'number' },
    name: { type: 'string' },
    description: { type: 'string' },
    isPublished: { type: 'bool' },
    dateAdded: { type: 'string' },
    dateModified: { type: 'string' },
    createdBy: { type: 'number' },
    createdByUser: { type: 'string' },
    modifiedBy: { type: 'number' },
    modifiedByUser: { type: 'string' },
    publishUp: { type: 'string' },
    publishDown: { type: 'string' },
    category: { type: MauticCampaignCategoryType },
  },
} satisfies TQoreResponseType;

export const MauticCampaignResponseType = {
  type: 'hash',
  fields: {
    campaign: { type: MauticCampaignType },
  },
} satisfies TQoreResponseType;
