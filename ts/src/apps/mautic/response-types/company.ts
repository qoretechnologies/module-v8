import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export type TMauticCompany = {
  id: number;
  score: number;
  fields: {
    core: Record<string, { id: number; group: string; label: string; alias: string; type: string; value: unknown }>;
    professional?: Record<string, unknown>;
    social?: Record<string, unknown>;
    personal?: Record<string, unknown>;
    other?: Record<string, unknown>;
    all: Record<string, unknown>;
  };
};

const MauticCompanyFieldsType = {
  type: 'hash',
  fields: {
    core: {
      type: { type: 'hash' },
    },
    professional: {
      type: { type: 'hash' },
    },
    social: {
      type: { type: 'hash' },
    },
    personal: {
      type: { type: 'hash' },
    },
    other: {
      type: { type: 'hash' },
    },
    all: {
      type: { type: 'hash' },
    },
  },
} satisfies TQoreResponseType;

export const MauticCompanyType = {
  type: 'hash',
  fields: {
    id: { type: 'number' },
    score: { type: 'number' },
    fields: { type: MauticCompanyFieldsType },
  },
} satisfies TQoreResponseType;

export const MauticCompanyResponseType = {
  type: 'hash',
  fields: {
    company: { type: MauticCompanyType },
  },
} satisfies TQoreResponseType;

export const MauticCompaniesListResponseType = {
  type: 'hash',
  fields: {
    total: { type: 'number' },
    companies: {
      type: {
        type: 'list',
        element_type: MauticCompanyType,
      },
    },
  },
} satisfies TQoreResponseType;
