/**
 * Jira Record-Based Helpers Constants
 *
 * This module provides utilities for working with Jira's structure
 * in a record-based context where Projects are treated as "tables"
 * and Issues as "records".
 *
 * Jira hierarchy: Project -> Issue
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { TQoreType } from '@qoretechnologies/ts-toolkit';

/**
 * Custom error class for Jira record-based operations
 */
export class JiraRecordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JiraRecordError';
  }
}

/**
 * Maximum page size for Jira API search
 */
export const MAX_PAGE_SIZE = 100;

/**
 * Maximum issues per bulk create request
 */
export const MAX_BULK_CREATE = 50;

/**
 * Custom field prefix for distinguishing custom fields from standard fields
 */
export const CUSTOM_FIELD_PREFIX = 'cf_';

/**
 * Jira project from API
 */
export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey?: string;
  avatarUrls?: Record<string, string>;
}

/**
 * Jira field definition from API
 */
export interface JiraField {
  id: string;
  key: string;
  name: string;
  custom: boolean;
  schema?: {
    type: string;
    items?: string;
    system?: string;
    custom?: string;
    customId?: number;
  };
}

/**
 * Jira issue from API
 */
export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: Record<string, unknown>;
}

/**
 * Jira search response from API
 */
export interface JiraSearchResponse {
  issues: JiraIssue[];
  startAt: number;
  maxResults: number;
  total: number;
}

/**
 * Jira bulk create response from API
 */
export interface JiraBulkCreateResponse {
  issues: Array<{ id: string; key: string; self: string }>;
  errors: Array<{ status: number; elementErrors: unknown }>;
}

/**
 * Standard issue fields type definition
 */
export const STANDARD_ISSUE_FIELDS: Record<string, TQoreType> = {
  id: 'string',
  key: 'string',
  summary: 'string',
  description: 'string',
  status: 'string',
  statusId: 'string',
  priority: 'string',
  priorityId: 'string',
  issuetype: 'string',
  issuetypeId: 'string',
  assignee: 'string',
  assigneeName: 'string',
  reporter: 'string',
  reporterName: 'string',
  created: 'date',
  updated: 'date',
  duedate: 'date',
  resolution: 'string',
  resolutionId: 'string',
  labels: { type: 'list', element_type: 'string' },
  components: { type: 'list', element_type: 'string' },
  fixVersions: { type: 'list', element_type: 'string' },
  affectsVersions: { type: 'list', element_type: 'string' },
  url: 'string',
  project: 'string',
  projectId: 'string',
  projectName: 'string',
};

/**
 * Map Jira field schema type to Qore type
 */
export const mapJiraFieldTypeToQore = (schema?: JiraField['schema']): TQoreType => {
  if (!schema) {
    return 'any';
  }

  const typeMap: Record<string, TQoreType> = {
    string: 'string',
    number: 'number',
    datetime: 'date',
    date: 'date',
    user: 'string',
    priority: 'string',
    status: 'string',
    issuetype: 'string',
    resolution: 'string',
    project: 'string',
    option: 'string',
    'option-with-child': 'string',
  };

  if (schema.type === 'array') {
    return { type: 'list', element_type: typeMap[schema.items || 'string'] || 'any' };
  }

  return typeMap[schema.type] || 'any';
};

/**
 * Helper to extract text from ADF (Atlassian Document Format)
 */
const extractTextFromADF = (content: unknown[]): string => {
  if (!Array.isArray(content)) {
    return '';
  }

  return content
    .map((node: unknown) => {
      if (typeof node !== 'object' || node === null) {
        return '';
      }
      const nodeObj = node as { type?: string; text?: string; content?: unknown[] };
      if (nodeObj.type === 'text') {
        return nodeObj.text || '';
      }
      if (nodeObj.content) {
        return extractTextFromADF(nodeObj.content);
      }
      return '';
    })
    .join('\n');
};

/**
 * Extract plain text from Jira description (ADF format)
 */
const extractDescriptionText = (description: unknown): string => {
  if (!description) {
    return '';
  }
  if (typeof description === 'string') {
    return description;
  }

  const descObj = description as { type?: string; content?: unknown[] };
  if (descObj.type === 'doc' && descObj.content) {
    return extractTextFromADF(descObj.content);
  }

  return '';
};

/**
 * Extract value from custom field based on type
 */
const extractCustomFieldValue = (value: unknown, fieldDef: JiraField): unknown => {
  if (value === null || value === undefined) {
    return null;
  }

  const schema = fieldDef.schema;
  if (!schema) {
    return value;
  }

  // Handle option fields
  if (schema.type === 'option' || schema.custom?.includes('select')) {
    const optionValue = value as { value?: string; name?: string } | null;
    return optionValue?.value || optionValue?.name || null;
  }

  // Handle user fields
  if (schema.type === 'user') {
    const userValue = value as { accountId?: string } | null;
    return userValue?.accountId || null;
  }

  // Handle array fields
  if (schema.type === 'array') {
    if (Array.isArray(value)) {
      return value.map((v: unknown) => {
        const item = v as { value?: string; name?: string; accountId?: string } | null;
        return item?.value || item?.name || item?.accountId || v;
      });
    }
  }

  return value;
};

/**
 * Transform a Jira issue to a flat record format
 */
export const transformIssueToRecord = (
  issue: JiraIssue,
  customFieldDefs: Map<string, JiraField>
): Record<string, unknown> => {
  const fields = issue.fields as Record<string, unknown>;

  const record: Record<string, unknown> = {
    id: issue.id,
    key: issue.key,
    summary: fields.summary || '',
    description: extractDescriptionText(fields.description),
    status: (fields.status as { name?: string } | null)?.name || null,
    statusId: (fields.status as { id?: string } | null)?.id || null,
    priority: (fields.priority as { name?: string } | null)?.name || null,
    priorityId: (fields.priority as { id?: string } | null)?.id || null,
    issuetype: (fields.issuetype as { name?: string } | null)?.name || null,
    issuetypeId: (fields.issuetype as { id?: string } | null)?.id || null,
    assignee: (fields.assignee as { accountId?: string } | null)?.accountId || null,
    assigneeName: (fields.assignee as { displayName?: string } | null)?.displayName || null,
    reporter: (fields.reporter as { accountId?: string } | null)?.accountId || null,
    reporterName: (fields.reporter as { displayName?: string } | null)?.displayName || null,
    created: fields.created || null,
    updated: fields.updated || null,
    duedate: fields.duedate || null,
    resolution: (fields.resolution as { name?: string } | null)?.name || null,
    resolutionId: (fields.resolution as { id?: string } | null)?.id || null,
    labels: (fields.labels as string[]) || [],
    components: ((fields.components as { name?: string }[]) || []).map((c) => c.name),
    fixVersions: ((fields.fixVersions as { name?: string }[]) || []).map((v) => v.name),
    affectsVersions: ((fields.versions as { name?: string }[]) || []).map((v) => v.name),
    url: issue.self?.replace('/rest/api/3/issue/', '/browse/') || '',
    project: (fields.project as { key?: string } | null)?.key || null,
    projectId: (fields.project as { id?: string } | null)?.id || null,
    projectName: (fields.project as { name?: string } | null)?.name || null,
  };

  // Flatten custom fields with cf_ prefix
  for (const [fieldId, value] of Object.entries(fields)) {
    if (fieldId.startsWith('customfield_')) {
      const fieldDef = [...customFieldDefs.values()].find((f) => f.id === fieldId);
      if (fieldDef) {
        const fieldKey = `${CUSTOM_FIELD_PREFIX}${fieldDef.name.replace(/\s+/g, '_')}`;
        record[fieldKey] = extractCustomFieldValue(value, fieldDef);
      }
    }
  }

  return record;
};

/**
 * Convert plain text to ADF (Atlassian Document Format) for description
 */
const textToADF = (text: string): Record<string, unknown> => {
  return {
    type: 'doc',
    version: 1,
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text }],
      },
    ],
  };
};

/**
 * Transform a flat record to Jira issue create payload
 */
export const transformRecordToCreatePayload = (
  record: Record<string, unknown>,
  projectKey: string,
  customFieldMap: Map<string, JiraField>
): Record<string, unknown> => {
  const fields: Record<string, unknown> = {
    project: { key: projectKey },
    summary: record.summary || 'Untitled Issue',
  };

  // Handle description
  if (record.description) {
    fields.description = textToADF(String(record.description));
  }

  // Handle issue type
  if (record.issuetype || record.issuetypeId) {
    fields.issuetype = record.issuetypeId ? { id: record.issuetypeId } : { name: record.issuetype };
  } else {
    // Default to Task if no issue type specified
    fields.issuetype = { name: 'Task' };
  }

  // Handle priority
  if (record.priority || record.priorityId) {
    fields.priority = record.priorityId ? { id: record.priorityId } : { name: record.priority };
  }

  // Handle assignee
  if (record.assignee) {
    fields.assignee = { accountId: record.assignee };
  }

  // Handle reporter
  if (record.reporter) {
    fields.reporter = { accountId: record.reporter };
  }

  // Handle due date
  if (record.duedate) {
    fields.duedate = record.duedate;
  }

  // Handle labels
  if (record.labels && Array.isArray(record.labels)) {
    fields.labels = record.labels;
  }

  // Handle custom fields
  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith(CUSTOM_FIELD_PREFIX) && value !== undefined && value !== null) {
      const fieldName = key.slice(CUSTOM_FIELD_PREFIX.length).replace(/_/g, ' ');
      const fieldDef = [...customFieldMap.values()].find(
        (f) => f.name === fieldName || f.name.replace(/\s+/g, '_') === key.slice(CUSTOM_FIELD_PREFIX.length)
      );
      if (fieldDef) {
        fields[fieldDef.id] = value;
      }
    }
  }

  return { fields };
};

/**
 * Transform a flat record to Jira issue update payload
 */
export const transformRecordToUpdatePayload = (
  record: Record<string, unknown>,
  customFieldMap: Map<string, JiraField>
): Record<string, unknown> => {
  const fields: Record<string, unknown> = {};

  // Handle summary
  if (record.summary !== undefined) {
    fields.summary = record.summary;
  }

  // Handle description
  if (record.description !== undefined) {
    fields.description = record.description ? textToADF(String(record.description)) : null;
  }

  // Handle issue type
  if (record.issuetype !== undefined || record.issuetypeId !== undefined) {
    fields.issuetype = record.issuetypeId ? { id: record.issuetypeId } : { name: record.issuetype };
  }

  // Handle priority
  if (record.priority !== undefined || record.priorityId !== undefined) {
    fields.priority = record.priorityId ? { id: record.priorityId } : { name: record.priority };
  }

  // Handle assignee
  if (record.assignee !== undefined) {
    fields.assignee = record.assignee ? { accountId: record.assignee } : null;
  }

  // Handle reporter
  if (record.reporter !== undefined) {
    fields.reporter = record.reporter ? { accountId: record.reporter } : null;
  }

  // Handle due date
  if (record.duedate !== undefined) {
    fields.duedate = record.duedate || null;
  }

  // Handle labels
  if (record.labels !== undefined) {
    fields.labels = Array.isArray(record.labels) ? record.labels : [];
  }

  // Handle custom fields
  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith(CUSTOM_FIELD_PREFIX)) {
      const fieldName = key.slice(CUSTOM_FIELD_PREFIX.length).replace(/_/g, ' ');
      const fieldDef = [...customFieldMap.values()].find(
        (f) => f.name === fieldName || f.name.replace(/\s+/g, '_') === key.slice(CUSTOM_FIELD_PREFIX.length)
      );
      if (fieldDef) {
        fields[fieldDef.id] = value;
      }
    }
  }

  return { fields };
};

/**
 * Normalize set values to single record (for update operations)
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

/**
 * Cache structure for Jira mappings
 */
type JiraMappings = {
  projects: Map<string, JiraProject>;
  fields: Map<string, JiraField>;
};

let mappingsCache: JiraMappings | null = null;
let mappingsCacheCloudId: string | null = null;

/**
 * Clear the mappings cache (useful for testing)
 */
export const clearMappingsCache = (): void => {
  mappingsCache = null;
  mappingsCacheCloudId = null;
};

/**
 * Ensure cache is initialized and return it
 */
export const ensureMappingsCache = async (
  _token: string,
  cloudId: string
): Promise<JiraMappings> => {
  if (mappingsCache && mappingsCacheCloudId === cloudId) {
    return mappingsCache;
  }

  // Initialize empty cache - will be populated on demand
  mappingsCache = {
    projects: new Map(),
    fields: new Map(),
  };
  mappingsCacheCloudId = cloudId;

  return mappingsCache;
};

/**
 * Jira authentication options
 */
export interface JiraAuthOptions {
  token?: string;
  username?: string;
  password?: string;
}

/**
 * Build Jira authorization header based on available credentials.
 * Supports both OAuth2 (Bearer token) and Basic Auth (username + API token).
 */
export const buildJiraAuthHeader = (auth: JiraAuthOptions): string => {
  if (auth.token) {
    // OAuth2 Bearer token
    return `Bearer ${auth.token}`;
  }
  if (auth.username && auth.password) {
    // Basic Auth with email + API token
    const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
    return `Basic ${credentials}`;
  }
  throw new JiraRecordError('Missing Jira authentication credentials (token or username/password)');
};

/**
 * Fetch custom fields for the Jira instance
 */
export const fetchCustomFields = async (
  auth: JiraAuthOptions,
  cloudId: string
): Promise<Map<string, JiraField>> => {
  const { data } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: buildJiraAuthHeader(auth),
      },
      path: `/ex/jira/${cloudId}/rest/api/3/field`,
    },
    { url: 'https://api.atlassian.com', endpointId: 'Jira' }
  );

  const fields = data as JiraField[];
  const fieldsMap = new Map<string, JiraField>();
  for (const field of fields || []) {
    if (field.custom) {
      fieldsMap.set(field.name, field);
    }
  }

  return fieldsMap;
};
