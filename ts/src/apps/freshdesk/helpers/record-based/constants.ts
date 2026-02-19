/**
 * Freshdesk Record-Based Helpers Constants
 *
 * This module provides utilities for working with Freshdesk's flat entity structure
 * in a record-based context where entities (Tickets, Contacts, Companies) are treated as "tables".
 *
 * Freshdesk hierarchy: flat (entity types as tables, records as rows)
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreType } from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../../utils/Debugger';
import { freshdeskClient } from '../../client';

/**
 * Custom error class for Freshdesk record-based operations
 */
export class FreshdeskRecordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FreshdeskRecordError';
  }
}

/**
 * Supported Freshdesk entities as record-based tables
 */
export const FRESHDESK_ENTITIES = ['Tickets', 'Contacts', 'Companies'] as const;
export type FreshdeskEntity = (typeof FRESHDESK_ENTITIES)[number];

/**
 * Custom field prefix used by Freshdesk
 */
export const CUSTOM_FIELD_PREFIX = 'cf_';

/**
 * Maximum page size for list endpoints
 */
export const MAX_PAGE_SIZE = 100;

/**
 * Maximum pages for search endpoints (Freshdesk limitation)
 */
export const MAX_SEARCH_PAGES = 10;

/**
 * Search results per page (fixed by Freshdesk search API)
 */
export const SEARCH_PAGE_SIZE = 30;

/**
 * Entity configuration mapping entity names to API paths
 */
export const ENTITY_CONFIG: Record<
  FreshdeskEntity,
  {
    listPath: string;
    singlePath: string;
    searchPath: string;
    fieldsPath: string;
  }
> = {
  Tickets: {
    listPath: '/api/v2/tickets',
    singlePath: '/api/v2/tickets',
    searchPath: '/api/v2/search/tickets',
    fieldsPath: '/api/v2/admin/ticket_fields',
  },
  Contacts: {
    listPath: '/api/v2/contacts',
    singlePath: '/api/v2/contacts',
    searchPath: '/api/v2/search/contacts',
    fieldsPath: '/api/v2/contact_fields',
  },
  Companies: {
    listPath: '/api/v2/companies',
    singlePath: '/api/v2/companies',
    searchPath: '/api/v2/search/companies',
    fieldsPath: '/api/v2/company_fields',
  },
};

/**
 * Standard field definitions per entity type
 */
type TFieldDefinition = {
  type: TQoreType;
  desc: string;
};

export const TICKET_FIELDS: Record<string, TFieldDefinition> = {
  id: { type: 'int', desc: 'Unique ID of the ticket' },
  subject: { type: 'string', desc: 'Subject of the ticket' },
  description_text: { type: 'string', desc: 'Plain text content of the ticket' },
  description: { type: 'string', desc: 'HTML content of the ticket' },
  status: { type: 'int', desc: 'Status (2=Open, 3=Pending, 4=Resolved, 5=Closed)' },
  priority: { type: 'int', desc: 'Priority (1=Low, 2=Medium, 3=High, 4=Urgent)' },
  source: { type: 'int', desc: 'Channel through which the ticket was created' },
  type: { type: 'string', desc: 'Type of the ticket' },
  requester_id: { type: 'int', desc: 'User ID of the requester' },
  responder_id: { type: 'int', desc: 'ID of the assigned agent' },
  company_id: { type: 'int', desc: 'Company ID of the requester' },
  group_id: { type: 'int', desc: 'ID of the assigned group' },
  product_id: { type: 'int', desc: 'ID of the associated product' },
  email: { type: 'string', desc: 'Email address of the requester' },
  phone: { type: 'string', desc: 'Phone number of the requester' },
  tags: { type: { type: 'list', element_type: 'string' }, desc: 'Tags associated with the ticket' },
  due_by: { type: 'date', desc: 'When the ticket is due to be resolved' },
  fr_due_by: { type: 'date', desc: 'When the first response is due' },
  created_at: { type: 'date', desc: 'Ticket creation timestamp' },
  updated_at: { type: 'date', desc: 'Ticket last updated timestamp' },
};

export const CONTACT_FIELDS: Record<string, TFieldDefinition> = {
  id: { type: 'int', desc: 'Unique ID of the contact' },
  name: { type: 'string', desc: 'Name of the contact' },
  email: { type: 'string', desc: 'Primary email address' },
  phone: { type: 'string', desc: 'Phone number' },
  mobile: { type: 'string', desc: 'Mobile number' },
  address: { type: 'string', desc: 'Address of the contact' },
  description: { type: 'string', desc: 'Description of the contact' },
  job_title: { type: 'string', desc: 'Job title' },
  language: { type: 'string', desc: 'Language of the contact' },
  time_zone: { type: 'string', desc: 'Time zone of the contact' },
  company_id: { type: 'int', desc: 'ID of the associated company' },
  active: { type: 'bool', desc: 'Whether the contact is active' },
  tags: { type: { type: 'list', element_type: 'string' }, desc: 'Tags associated with the contact' },
  other_emails: {
    type: { type: 'list', element_type: 'string' },
    desc: 'Additional email addresses',
  },
  twitter_id: { type: 'string', desc: 'Twitter handle' },
  unique_external_id: { type: 'string', desc: 'External ID for the contact' },
  created_at: { type: 'date', desc: 'Contact creation timestamp' },
  updated_at: { type: 'date', desc: 'Contact last updated timestamp' },
};

export const COMPANY_FIELDS: Record<string, TFieldDefinition> = {
  id: { type: 'int', desc: 'Unique ID of the company' },
  name: { type: 'string', desc: 'Name of the company' },
  description: { type: 'string', desc: 'Description of the company' },
  note: { type: 'string', desc: 'Note about the company' },
  domains: {
    type: { type: 'list', element_type: 'string' },
    desc: 'Domains associated with the company',
  },
  health_score: { type: 'string', desc: 'Relationship strength with the company' },
  account_tier: { type: 'string', desc: 'Company value classification' },
  industry: { type: 'string', desc: 'Industry the company operates in' },
  renewal_date: { type: 'date', desc: 'Contract renewal date' },
  created_at: { type: 'date', desc: 'Company creation timestamp' },
  updated_at: { type: 'date', desc: 'Company last updated timestamp' },
};

/**
 * Map entity type to its standard fields
 */
export const STANDARD_FIELDS: Record<FreshdeskEntity, Record<string, TFieldDefinition>> = {
  Tickets: TICKET_FIELDS,
  Contacts: CONTACT_FIELDS,
  Companies: COMPANY_FIELDS,
};

/**
 * Resolve and validate a table path to a FreshdeskEntity
 */
export const resolveEntity = (tablePath: string | undefined): FreshdeskEntity => {
  if (!tablePath) {
    throw new FreshdeskRecordError('Table path is required.');
  }

  if (!FRESHDESK_ENTITIES.includes(tablePath as FreshdeskEntity)) {
    throw new FreshdeskRecordError(
      `Unknown table: "${tablePath}". Valid tables: ${FRESHDESK_ENTITIES.join(', ')}`
    );
  }

  return tablePath as FreshdeskEntity;
};

// ---- Custom field caching ----

type TFreshdeskCustomField = {
  id: number;
  name: string;
  label: string;
  type: string;
  choices?: Record<string, string> | string[];
};

type TCustomFieldCache = {
  fields: Map<string, TFreshdeskCustomField>;
  token: string;
};

const customFieldCaches: Record<string, TCustomFieldCache | null> = {
  Tickets: null,
  Contacts: null,
  Companies: null,
};

/**
 * Clear custom field caches (useful for testing)
 */
export const clearCustomFieldsCache = (): void => {
  customFieldCaches.Tickets = null;
  customFieldCaches.Contacts = null;
  customFieldCaches.Companies = null;
};

/**
 * Fetch and cache custom fields for an entity type
 */
export const getCustomFields = async (
  token: string,
  subdomain: string,
  entity: FreshdeskEntity
): Promise<Map<string, TFreshdeskCustomField>> => {
  const cache = customFieldCaches[entity];

  if (cache && cache.token === token) {
    return cache.fields;
  }

  const config = ENTITY_CONFIG[entity];
  const fieldsMap = new Map<string, TFreshdeskCustomField>();

  try {
    const fields = await freshdeskClient.get<TFreshdeskCustomField[]>(config.fieldsPath, {
      token,
      connectionOptions: { subdomain },
    });

    if (Array.isArray(fields)) {
      for (const field of fields) {
        // Custom fields have names starting with cf_
        if (field.name && field.name.startsWith(CUSTOM_FIELD_PREFIX)) {
          fieldsMap.set(field.name, field);
        }
      }
    }
  } catch (error) {
    Debugger.log(`Failed to fetch custom fields for ${entity}: ${error}`);
  }

  customFieldCaches[entity] = { fields: fieldsMap, token };

  return fieldsMap;
};

/**
 * Map Freshdesk field types to Qore types
 */
export const mapFreshdeskFieldTypeToQore = (freshdeskType: string): TQoreType => {
  const typeMap: Record<string, TQoreType> = {
    custom_text: 'string',
    custom_paragraph: 'string',
    custom_number: 'number',
    custom_decimal: 'number',
    custom_date: 'date',
    custom_checkbox: 'bool',
    custom_dropdown: 'string',
    custom_url: 'string',
    custom_phone_number: 'string',
    // Default field types
    default_requester: 'int',
    default_subject: 'string',
    default_ticket_type: 'string',
    default_description: 'string',
    default_status: 'int',
    default_priority: 'int',
    default_source: 'int',
    default_group: 'int',
    default_agent: 'int',
    default_company: 'int',
    default_product: 'int',
  };

  return typeMap[freshdeskType] || 'string';
};

/**
 * Transform an entity API response to a flat record format.
 * Custom fields are extracted from the custom_fields property and flattened with their cf_ prefix.
 */
export const transformEntityToRecord = (
  item: Record<string, unknown>,
  entity: FreshdeskEntity
): Record<string, unknown> => {
  const record: Record<string, unknown> = {};
  const standardFields = STANDARD_FIELDS[entity];

  // Copy standard fields
  for (const fieldName of Object.keys(standardFields)) {
    if (fieldName in item) {
      record[fieldName] = item[fieldName];
    } else {
      record[fieldName] = null;
    }
  }

  // Flatten custom fields from the custom_fields property
  const customFields = item.custom_fields as Record<string, unknown> | undefined;
  if (customFields && typeof customFields === 'object') {
    for (const [key, value] of Object.entries(customFields)) {
      // Freshdesk already uses cf_ prefix in custom field names
      const fieldName = key.startsWith(CUSTOM_FIELD_PREFIX) ? key : `${CUSTOM_FIELD_PREFIX}${key}`;
      record[fieldName] = value;
    }
  }

  return record;
};

/**
 * Transform a record back to API payload format for create/update operations.
 * Separates standard fields from custom fields.
 */
export const transformRecordToPayload = (
  record: Record<string, unknown>,
  entity: FreshdeskEntity
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};
  const customFields: Record<string, unknown> = {};
  const standardFields = STANDARD_FIELDS[entity];

  for (const [key, value] of Object.entries(record)) {
    if (value === undefined) {
      continue;
    }

    // Skip read-only fields
    if (key === 'id' || key === 'created_at' || key === 'updated_at') {
      continue;
    }

    if (key.startsWith(CUSTOM_FIELD_PREFIX)) {
      customFields[key] = value;
    } else if (key in standardFields) {
      payload[key] = value;
    }
  }

  if (Object.keys(customFields).length > 0) {
    payload.custom_fields = customFields;
  }

  return payload;
};

/**
 * Normalize `set` parameter into a single flat object of fields to update.
 * Handles both column format ({ field: [val1, val2] }) and plain object format ({ field: val }).
 */
export const normalizeSetToSingleRecord = (
  input: unknown,
  mapColumnFormatToObject: (data: Record<string, unknown>) => Record<string, unknown>[]
): Record<string, unknown> => {
  if (Array.isArray(input)) {
    if (input.length > 1) {
      throw new FreshdeskRecordError(
        `Freshdesk update supports a single record in 'set'; received ${input.length} records.`
      );
    }
    return (input[0] as Record<string, unknown>) || {};
  }

  if (input && typeof input === 'object') {
    const values = Object.values(input);
    const allArrays = values.length > 0 && values.every((v) => Array.isArray(v));
    const lengths = allArrays ? values.map((v) => (v as unknown[]).length) : [];
    const sameLength = lengths.length > 0 && new Set(lengths).size === 1;

    if (allArrays && sameLength) {
      const records = mapColumnFormatToObject(input as Record<string, unknown>);
      if (records.length > 1) {
        throw new FreshdeskRecordError(
          `Freshdesk update supports a single record in 'set'; received ${records.length} records.`
        );
      }
      return records[0] || {};
    }

    return input as Record<string, unknown>;
  }

  return {};
};

