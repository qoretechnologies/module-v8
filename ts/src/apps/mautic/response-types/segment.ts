import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export type TMauticSegment = {
  id: number;
  name: string;
  alias: string;
  description: string | null;
  isPublished: boolean;
  isGlobal: boolean;
  dateAdded: string;
  dateModified: string;
  createdBy: number;
  createdByUser: string;
  modifiedBy: number;
  modifiedByUser: string;
  category: {
    id: number;
    title: string;
    alias: string;
    color: string;
  } | null;
};

const MauticSegmentCategoryType = {
  type: 'hash',
  fields: {
    id: { type: 'number' },
    title: { type: 'string' },
    alias: { type: 'string' },
    color: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const MauticSegmentType = {
  type: 'hash',
  fields: {
    id: { type: 'number' },
    name: { type: 'string' },
    alias: { type: 'string' },
    description: { type: 'string' },
    isPublished: { type: 'bool' },
    isGlobal: { type: 'bool' },
    dateAdded: { type: 'string' },
    dateModified: { type: 'string' },
    createdBy: { type: 'number' },
    createdByUser: { type: 'string' },
    modifiedBy: { type: 'number' },
    modifiedByUser: { type: 'string' },
    category: { type: MauticSegmentCategoryType },
  },
} satisfies TQoreResponseType;

export const MauticSegmentResponseType = {
  type: 'hash',
  fields: {
    list: { type: MauticSegmentType },
  },
} satisfies TQoreResponseType;
