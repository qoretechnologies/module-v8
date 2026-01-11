import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export type TMauticContact = {
  id: number;
  isPublished: boolean;
  dateAdded: string;
  dateModified: string | null;
  createdBy: number;
  createdByUser: string;
  modifiedBy: number | null;
  modifiedByUser: string | null;
  owner: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  } | null;
  points: number;
  lastActive: string | null;
  dateIdentified: string | null;
  color: string | null;
  fields: {
    core: Record<string, { id: number; group: string; label: string; alias: string; type: string; value: unknown }>;
    social: Record<string, { id: number; group: string; label: string; alias: string; type: string; value: unknown }>;
    personal: Record<string, { id: number; group: string; label: string; alias: string; type: string; value: unknown }>;
    professional: Record<string, { id: number; group: string; label: string; alias: string; type: string; value: unknown }>;
    all: Record<string, unknown>;
  };
  ipAddresses: unknown[];
  tags: Array<{ tag: string }>;
  utmtags: unknown[] | null;
  stage: unknown;
  preferredProfileImage: string | null;
  doNotContact: Array<{ id: number; reason: number; comments: string; channel: string; channelId: number | null }>;
  frequencyRules: unknown[];
};

const MauticOwnerType = {
  type: 'hash',
  fields: {
    id: { type: 'number' },
    username: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
  },
} satisfies TQoreResponseType;

const MauticTagType = {
  type: 'hash',
  fields: {
    tag: { type: 'string' },
  },
} satisfies TQoreResponseType;

const MauticDoNotContactType = {
  type: 'hash',
  fields: {
    id: { type: 'number' },
    reason: { type: 'number' },
    comments: { type: 'string' },
    channel: { type: 'string' },
    channelId: { type: 'number' },
  },
} satisfies TQoreResponseType;

const MauticFieldsType = {
  type: 'hash',
  fields: {
    core: {
      type: { type: 'hash' },
    },
    social: {
      type: { type: 'hash' },
    },
    personal: {
      type: { type: 'hash' },
    },
    professional: {
      type: { type: 'hash' },
    },
    all: {
      type: { type: 'hash' },
    },
  },
} satisfies TQoreResponseType;

export const MauticContactType = {
  type: 'hash',
  fields: {
    id: { type: 'number' },
    isPublished: { type: 'bool' },
    dateAdded: { type: 'string' },
    dateModified: { type: 'string' },
    createdBy: { type: 'number' },
    createdByUser: { type: 'string' },
    modifiedBy: { type: 'number' },
    modifiedByUser: { type: 'string' },
    owner: { type: MauticOwnerType },
    points: { type: 'number' },
    lastActive: { type: 'string' },
    dateIdentified: { type: 'string' },
    color: { type: 'string' },
    fields: { type: MauticFieldsType },
    ipAddresses: {
      type: {
        type: 'list',
        element_type: 'hash',
      },
    },
    tags: {
      type: {
        type: 'list',
        element_type: MauticTagType,
      },
    },
    utmtags: {
      type: {
        type: 'list',
        element_type: 'hash',
      },
    },
    stage: { type: 'hash' },
    preferredProfileImage: { type: 'string' },
    doNotContact: {
      type: {
        type: 'list',
        element_type: MauticDoNotContactType,
      },
    },
    frequencyRules: {
      type: {
        type: 'list',
        element_type: 'hash',
      },
    },
  },
} satisfies TQoreResponseType;

export const MauticContactResponseType = {
  type: 'hash',
  fields: {
    contact: { type: MauticContactType },
  },
} satisfies TQoreResponseType;

export const MauticContactsListResponseType = {
  type: 'hash',
  fields: {
    total: { type: 'number' },
    contacts: {
      type: {
        type: 'list',
        element_type: MauticContactType,
      },
    },
  },
} satisfies TQoreResponseType;
