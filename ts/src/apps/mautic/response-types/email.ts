import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export type TMauticEmail = {
  id: number;
  name: string;
  subject: string;
  fromAddress: string | null;
  fromName: string | null;
  replyToAddress: string | null;
  bccAddress: string | null;
  template: string | null;
  customHtml: string | null;
  plainText: string | null;
  isPublished: boolean;
  dateAdded: string;
  dateModified: string;
  createdBy: number;
  createdByUser: string;
  modifiedBy: number;
  modifiedByUser: string;
  publishUp: string | null;
  publishDown: string | null;
  readCount: number;
  sentCount: number;
  revision: number;
  emailType: 'list' | 'template';
  lists: Array<{
    id: number;
    name: string;
    alias: string;
  }>;
  language: string;
  category: {
    id: number;
    title: string;
    alias: string;
    color: string;
  } | null;
};

const MauticEmailCategoryType = {
  type: 'hash',
  fields: {
    id: { type: 'number' },
    title: { type: 'string' },
    alias: { type: 'string' },
    color: { type: 'string' },
  },
} satisfies TQoreResponseType;

const MauticEmailListType = {
  type: 'hash',
  fields: {
    id: { type: 'number' },
    name: { type: 'string' },
    alias: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const MauticEmailType = {
  type: 'hash',
  fields: {
    id: { type: 'number' },
    name: { type: 'string' },
    subject: { type: 'string' },
    fromAddress: { type: 'string' },
    fromName: { type: 'string' },
    replyToAddress: { type: 'string' },
    bccAddress: { type: 'string' },
    template: { type: 'string' },
    customHtml: { type: 'string' },
    plainText: { type: 'string' },
    isPublished: { type: 'bool' },
    dateAdded: { type: 'string' },
    dateModified: { type: 'string' },
    createdBy: { type: 'number' },
    createdByUser: { type: 'string' },
    modifiedBy: { type: 'number' },
    modifiedByUser: { type: 'string' },
    publishUp: { type: 'string' },
    publishDown: { type: 'string' },
    readCount: { type: 'number' },
    sentCount: { type: 'number' },
    revision: { type: 'number' },
    emailType: { type: 'string' },
    lists: {
      type: {
        type: 'list',
        element_type: MauticEmailListType,
      },
    },
    language: { type: 'string' },
    category: { type: MauticEmailCategoryType },
  },
} satisfies TQoreResponseType;

export const MauticEmailResponseType = {
  type: 'hash',
  fields: {
    email: { type: MauticEmailType },
  },
} satisfies TQoreResponseType;
