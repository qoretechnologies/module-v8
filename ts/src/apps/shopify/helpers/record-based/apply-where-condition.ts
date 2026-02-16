/**
 * Shopify Apply Where Condition
 *
 * Converts Qore WHERE expressions to Shopify GraphQL query strings.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import {
  isQoreRecordSearchExpression,
  TQoreSearchRecordsWhereConditions,
} from '@qoretechnologies/ts-toolkit';

/**
 * Map Qore field names to Shopify query field names
 */
const FIELD_MAPPING: Record<string, string> = {
  title: 'title',
  vendor: 'vendor',
  productType: 'product_type',
  status: 'status',
  tags: 'tag',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  publishedAt: 'published_at',
  handle: 'handle',
  id: 'id',
  totalInventory: 'inventory_total',
};

/**
 * Convert a Qore WHERE condition to a Shopify GraphQL query string
 */
export const convertWhereToShopifyQuery = (
  where: TQoreSearchRecordsWhereConditions | undefined
): string => {
  if (!where) {
    return '';
  }

  return processCondition(where);
};

/**
 * Process a single condition or expression
 */
const processCondition = (condition: TQoreSearchRecordsWhereConditions): string => {
  const { exp, args } = condition;

  if (!exp || !args) {
    return '';
  }

  // Logical operators
  if (exp === '&&') {
    const parts = args
      .filter(isQoreRecordSearchExpression)
      .map((arg) => processCondition(arg))
      .filter(Boolean);
    return parts.length > 0 ? parts.join(' AND ') : '';
  }

  if (exp === '||') {
    const parts = args
      .filter(isQoreRecordSearchExpression)
      .map((arg) => processCondition(arg))
      .filter(Boolean);
    return parts.length > 0 ? `(${parts.join(' OR ')})` : '';
  }

  // Comparison operators
  if (args.length >= 1) {
    const fieldArg = args[0] as { type_code: string; field?: string };
    const valueArg = args[1] as { type_code: string; value?: unknown } | undefined;

    if (fieldArg?.type_code === 'field reference' && fieldArg.field) {
      const field = mapFieldName(fieldArg.field);
      const value = valueArg?.value;

      return buildQueryPart(exp, field, value);
    }
  }

  return '';
};

/**
 * Map Qore field name to Shopify query field name
 */
const mapFieldName = (field: string): string => {
  return FIELD_MAPPING[field] || field;
};

/**
 * Build a single query part from operator, field, and value
 */
const buildQueryPart = (operator: string, field: string, value: unknown): string => {
  const stringValue = formatValue(value);

  switch (operator) {
    case '==':
      return `${field}:${stringValue}`;

    case '!=':
      return `NOT ${field}:${stringValue}`;

    case '>':
      return `${field}:>${stringValue}`;

    case '>=':
      return `${field}:>=${stringValue}`;

    case '<':
      return `${field}:<${stringValue}`;

    case '<=':
      return `${field}:<=${stringValue}`;

    case 'contains':
      return `${field}:*${stringValue}*`;

    case 'is-set':
      return `${field}:*`;

    case 'is-not-set':
      return `NOT ${field}:*`;

    default:
      return '';
  }
};

/**
 * Escape a string for safe inclusion in Shopify GraphQL query
 */
const escapeQueryString = (value: string): string => {
  return value
    .replaceAll('\\', '\\\\') // escape backslashes first
    .replaceAll('"', '\\"') // escape double quotes
    .replaceAll('\n', '\\n') // escape newlines
    .replaceAll('\r', '\\r') // escape carriage returns
    .replaceAll('\t', '\\t'); // escape tabs
};

/**
 * Format a value for Shopify query string
 */
const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    // Handle special status values
    if (['ACTIVE', 'ARCHIVED', 'DRAFT', 'active', 'archived', 'draft'].includes(value)) {
      return value.toLowerCase();
    }

    const escaped = escapeQueryString(value);

    // Quote strings with spaces (escaped for GraphQL query string)
    if (value.includes(' ')) {
      return `\\"${escaped}\\"`;
    }

    return escaped;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
};

/**
 * Apply client-side WHERE filtering to records
 * (Used as fallback when server-side filtering is not sufficient)
 */
export const filterRecordsClientSide = (
  records: Record<string, unknown>[],
  where: TQoreSearchRecordsWhereConditions | undefined
): Record<string, unknown>[] => {
  if (!where) {
    return records;
  }

  return records.filter((record) => evaluateCondition(record, where));
};

/**
 * Evaluate a condition against a single record
 */
const evaluateCondition = (
  record: Record<string, unknown>,
  condition: TQoreSearchRecordsWhereConditions
): boolean => {
  const { exp, args } = condition;

  if (!exp || !args) {
    return true;
  }

  // Logical operators
  if (exp === '&&') {
    return args.filter(isQoreRecordSearchExpression).every((arg) => evaluateCondition(record, arg));
  }

  if (exp === '||') {
    return args.filter(isQoreRecordSearchExpression).some((arg) => evaluateCondition(record, arg));
  }

  // Comparison operators
  if (args.length >= 1) {
    const fieldArg = args[0] as { type_code: string; field?: string };
    const valueArg = args[1] as { type_code: string; value?: unknown } | undefined;

    if (fieldArg?.type_code === 'field reference' && fieldArg.field) {
      const fieldValue = record[fieldArg.field];
      const compareValue = valueArg?.value;

      return evaluateComparison(exp, fieldValue, compareValue);
    }
  }

  return true;
};

/**
 * Evaluate a comparison between field value and compare value
 */
const evaluateComparison = (
  operator: string,
  fieldValue: unknown,
  compareValue: unknown
): boolean => {
  switch (operator) {
    case '==':
      return fieldValue === compareValue;

    case '!=':
      return fieldValue !== compareValue;

    case '>':
      return (
        typeof fieldValue === 'number' &&
        typeof compareValue === 'number' &&
        fieldValue > compareValue
      );

    case '>=':
      return (
        typeof fieldValue === 'number' &&
        typeof compareValue === 'number' &&
        fieldValue >= compareValue
      );

    case '<':
      return (
        typeof fieldValue === 'number' &&
        typeof compareValue === 'number' &&
        fieldValue < compareValue
      );

    case '<=':
      return (
        typeof fieldValue === 'number' &&
        typeof compareValue === 'number' &&
        fieldValue <= compareValue
      );

    case 'contains':
      return (
        typeof fieldValue === 'string' &&
        typeof compareValue === 'string' &&
        fieldValue.toLowerCase().includes(compareValue.toLowerCase())
      );

    case 'is-set':
      return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';

    case 'is-not-set':
      return fieldValue === null || fieldValue === undefined || fieldValue === '';

    default:
      return true;
  }
};

/**
 * Sort records by orderBy option
 */
export const sortRecords = (
  records: Record<string, unknown>[],
  orderBy: { field: string; direction?: string } | undefined
): Record<string, unknown>[] => {
  if (!orderBy || !orderBy.field) {
    return records;
  }

  const direction = orderBy.direction === 'desc' ? -1 : 1;

  // Map sort field to record field
  const sortFieldMap: Record<string, string> = {
    TITLE: 'title',
    PRODUCT_TYPE: 'productType',
    VENDOR: 'vendor',
    UPDATED_AT: 'updatedAt',
    CREATED_AT: 'createdAt',
    INVENTORY_TOTAL: 'totalInventory',
    ID: 'id',
    BEST_SELLING: 'id', // Fallback to ID for best selling (server handles this better)
  };

  const field = sortFieldMap[orderBy.field] || orderBy.field;

  return [...records].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    if (aValue === null || aValue === undefined) return 1 * direction;
    if (bValue === null || bValue === undefined) return -1 * direction;

    // Date comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const aDate = Date.parse(aValue);
      const bDate = Date.parse(bValue);

      if (!isNaN(aDate) && !isNaN(bDate)) {
        return (aDate - bDate) * direction;
      }

      return aValue.localeCompare(bValue) * direction;
    }

    // Number comparison
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * direction;
    }

    // String comparison (fallback)
    return String(aValue).localeCompare(String(bValue)) * direction;
  });
};
