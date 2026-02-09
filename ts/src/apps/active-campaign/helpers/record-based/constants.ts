/**
 * ActiveCampaign Record-Based Constants
 *
 * Entity configuration, standard field definitions, and data transformation
 * utilities for the record-based pattern.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreType } from '@qoretechnologies/ts-toolkit';
import { ActiveCampaignAccountCustomFieldTypeToQoreTypeMap } from '../get-custom-field-type';

/**
 * Custom error class for ActiveCampaign record-based operations
 */
export class ActiveCampaignRecordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ActiveCampaignRecordError';
  }
}

/**
 * Custom field prefix for distinguishing custom fields from standard fields
 */
export const CUSTOM_FIELD_PREFIX = 'cf_';

/**
 * Maximum page size for ActiveCampaign API
 */
export const MAX_PAGE_SIZE = 100;

/**
 * Available record types (tables) in ActiveCampaign
 */
export const ACTIVE_CAMPAIGN_RECORD_TYPES = ['Contacts', 'Deals', 'Accounts'] as const;

export type TActiveCampaignRecordType = (typeof ACTIVE_CAMPAIGN_RECORD_TYPES)[number];

/**
 * Per-entity API configuration
 */
export interface TEntityConfig {
  apiPath: string;
  itemsKey: string;
  itemKey: string;
  customFieldsPath: string;
  customFieldsItemsKey: string;
  sortableFields: string[];
  serverSideFilters: Record<string, { param: string; operator: string }>;
}

export const ENTITY_CONFIG: Record<TActiveCampaignRecordType, TEntityConfig> = {
  Contacts: {
    apiPath: 'contacts',
    itemsKey: 'contacts',
    itemKey: 'contact',
    customFieldsPath: 'fields',
    customFieldsItemsKey: 'fields',
    sortableFields: ['email', 'cdate', 'id', 'first_name', 'last_name'],
    serverSideFilters: {
      email: { param: 'email', operator: '==' },
      email_like: { param: 'email_like', operator: 'contains' },
      phone: { param: 'phone', operator: '==' },
      status: { param: 'status', operator: '==' },
      listid: { param: 'listid', operator: '==' },
    },
  },
  Deals: {
    apiPath: 'deals',
    itemsKey: 'deals',
    itemKey: 'deal',
    customFieldsPath: 'dealCustomFieldMeta',
    customFieldsItemsKey: 'dealCustomFieldMeta',
    sortableFields: ['cdate', 'title', 'value', 'next-action'],
    serverSideFilters: {},
  },
  Accounts: {
    apiPath: 'accounts',
    itemsKey: 'accounts',
    itemKey: 'account',
    customFieldsPath: 'accountCustomFieldMeta',
    customFieldsItemsKey: 'accountCustomFieldMeta',
    sortableFields: ['name', 'createdTimestamp', 'updatedTimestamp'],
    serverSideFilters: {},
  },
};

/**
 * Standard fields per entity type
 */
export const CONTACTS_STANDARD_FIELDS: Record<string, TQoreType> = {
  id: 'string',
  email: 'string',
  firstName: 'string',
  lastName: 'string',
  phone: 'string',
  cdate: 'date',
  udate: 'date',
  adate: 'date',
  edate: 'date',
  orgid: 'string',
  orgname: 'string',
  bounced_hard: 'string',
  bounced_soft: 'string',
  bounced_date: 'string',
  ip: 'string',
  sentcnt: 'string',
  rating_tstamp: 'string',
  deleted: 'string',
  anonymized: 'string',
};

export const DEALS_STANDARD_FIELDS: Record<string, TQoreType> = {
  id: 'string',
  title: 'string',
  description: 'string',
  value: 'string',
  currency: 'string',
  percent: 'string',
  owner: 'string',
  contact: 'string',
  organization: 'string',
  account: 'string',
  group: 'string',
  stage: 'string',
  status: 'string',
  cdate: 'date',
  mdate: 'date',
  edate: 'date',
  nextdate: 'date',
  winProbability: 'number',
  activitycount: 'string',
  isDisabled: 'bool',
};

export const ACCOUNTS_STANDARD_FIELDS: Record<string, TQoreType> = {
  id: 'string',
  name: 'string',
  accountUrl: 'string',
  createdTimestamp: 'date',
  updatedTimestamp: 'date',
  contactCount: 'number',
  dealCount: 'number',
};

/**
 * Get standard fields for an entity type
 */
export const getStandardFields = (entityType: TActiveCampaignRecordType): Record<string, TQoreType> => {
  switch (entityType) {
    case 'Contacts':
      return CONTACTS_STANDARD_FIELDS;
    case 'Deals':
      return DEALS_STANDARD_FIELDS;
    case 'Accounts':
      return ACCOUNTS_STANDARD_FIELDS;
    default:
      throw new ActiveCampaignRecordError(`Unknown entity type: ${entityType}`);
  }
};

/**
 * Custom field type map - reuses the existing one
 */
export const AC_FIELD_TYPE_TO_QORE = ActiveCampaignAccountCustomFieldTypeToQoreTypeMap;

/**
 * Contact fields that are writable (not read-only)
 */
const CONTACT_WRITABLE_FIELDS = ['email', 'firstName', 'lastName', 'phone'];

/**
 * Deal fields that are writable
 */
const DEAL_WRITABLE_FIELDS = [
  'title', 'description', 'value', 'currency', 'percent',
  'owner', 'contact', 'organization', 'account', 'group', 'stage', 'status',
];

/**
 * Account fields that are writable
 */
const ACCOUNT_WRITABLE_FIELDS = ['name', 'accountUrl', 'owner'];

/**
 * Transform an ActiveCampaign contact API response to a flat record
 */
export const transformContactToRecord = (
  contact: Record<string, unknown>,
  customFieldValues?: Array<{ field: string; value: string }>
): Record<string, unknown> => {
  const record: Record<string, unknown> = {
    id: contact.id,
    email: contact.email,
    firstName: contact.firstName,
    lastName: contact.lastName,
    phone: contact.phone,
    cdate: contact.cdate,
    udate: contact.udate,
    adate: contact.adate,
    edate: contact.edate,
    orgid: contact.orgid,
    orgname: contact.orgname,
    bounced_hard: contact.bounced_hard,
    bounced_soft: contact.bounced_soft,
    bounced_date: contact.bounced_date,
    ip: contact.ip,
    sentcnt: contact.sentcnt,
    rating_tstamp: contact.rating_tstamp,
    deleted: contact.deleted,
    anonymized: contact.anonymized,
  };

  if (customFieldValues) {
    for (const cfv of customFieldValues) {
      record[`${CUSTOM_FIELD_PREFIX}${cfv.field}`] = cfv.value;
    }
  }

  return record;
};

/**
 * Transform an ActiveCampaign deal API response to a flat record
 */
export const transformDealToRecord = (
  deal: Record<string, unknown>,
  customFieldValues?: Array<{ customFieldId: number | string; fieldValue: string }>
): Record<string, unknown> => {
  const record: Record<string, unknown> = {
    id: deal.id,
    title: deal.title,
    description: deal.description,
    value: deal.value,
    currency: deal.currency,
    percent: deal.percent,
    owner: deal.owner,
    contact: deal.contact,
    organization: deal.organization,
    account: deal.account,
    group: deal.group,
    stage: deal.stage,
    status: deal.status,
    cdate: deal.cdate,
    mdate: deal.mdate,
    edate: deal.edate,
    nextdate: deal.nextdate,
    winProbability: deal.winProbability,
    activitycount: deal.activitycount,
    isDisabled: deal.isDisabled,
  };

  if (customFieldValues) {
    for (const cfv of customFieldValues) {
      record[`${CUSTOM_FIELD_PREFIX}${cfv.customFieldId}`] = cfv.fieldValue;
    }
  }

  return record;
};

/**
 * Transform an ActiveCampaign account API response to a flat record
 */
export const transformAccountToRecord = (
  account: Record<string, unknown>,
  customFieldValues?: Array<{ customFieldId: number | string; fieldValue: string }>
): Record<string, unknown> => {
  const record: Record<string, unknown> = {
    id: account.id,
    name: account.name,
    accountUrl: account.accountUrl,
    createdTimestamp: account.createdTimestamp,
    updatedTimestamp: account.updatedTimestamp,
    contactCount: account.contactCount,
    dealCount: account.dealCount,
  };

  if (customFieldValues) {
    for (const cfv of customFieldValues) {
      record[`${CUSTOM_FIELD_PREFIX}${cfv.customFieldId}`] = cfv.fieldValue;
    }
  }

  return record;
};

/**
 * Transform a record to entity-appropriate API payload
 */
export const transformToRecord = (
  item: Record<string, unknown>,
  entityType: TActiveCampaignRecordType,
  customFieldValues?: Array<Record<string, unknown>>
): Record<string, unknown> => {
  switch (entityType) {
    case 'Contacts':
      return transformContactToRecord(
        item,
        customFieldValues as Array<{ field: string; value: string }>
      );
    case 'Deals':
      return transformDealToRecord(
        item,
        customFieldValues as Array<{ customFieldId: number | string; fieldValue: string }>
      );
    case 'Accounts':
      return transformAccountToRecord(
        item,
        customFieldValues as Array<{ customFieldId: number | string; fieldValue: string }>
      );
    default:
      throw new ActiveCampaignRecordError(`Unknown entity type: ${entityType}`);
  }
};

/**
 * Build an API create/update payload from a flat record
 */
export const transformRecordToPayload = (
  record: Record<string, unknown>,
  entityType: TActiveCampaignRecordType
): { standardPayload: Record<string, unknown>; customFields: Array<{ id: string; value: unknown }> } => {
  const standardPayload: Record<string, unknown> = {};
  const customFields: Array<{ id: string; value: unknown }> = [];

  const writableFields =
    entityType === 'Contacts'
      ? CONTACT_WRITABLE_FIELDS
      : entityType === 'Deals'
        ? DEAL_WRITABLE_FIELDS
        : ACCOUNT_WRITABLE_FIELDS;

  for (const [key, value] of Object.entries(record)) {
    if (key === 'id') {
      continue;
    }

    if (key.startsWith(CUSTOM_FIELD_PREFIX)) {
      const fieldId = key.slice(CUSTOM_FIELD_PREFIX.length);
      customFields.push({ id: fieldId, value });
    } else if (writableFields.includes(key)) {
      standardPayload[key] = value;
    }
  }

  // For contacts and accounts, custom fields go in the payload as `fields` array
  if (entityType !== 'Deals' && customFields.length > 0) {
    standardPayload.fields = customFields.map((cf) => ({
      customFieldId: cf.id,
      fieldValue: cf.value,
    }));
  }

  return { standardPayload, customFields };
};

/**
 * Normalize set values to single record (for update operations)
 * Handles both column format (arrays) and flat object format
 */
export const normalizeSetToSingleRecord = (
  set: Record<string, unknown[] | unknown>
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(set)) {
    if (Array.isArray(value)) {
      result[key] = value[0];
    } else {
      result[key] = value;
    }
  }

  return result;
};
