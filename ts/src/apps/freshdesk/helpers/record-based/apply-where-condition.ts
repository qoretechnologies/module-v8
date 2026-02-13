/**
 * Freshdesk Apply Where Condition
 *
 * Converts Qore WHERE conditions to Freshdesk search query strings.
 * Freshdesk search syntax: "field:value", "field:>'value'", "condition AND condition"
 *
 * Server-side operators: ==, >, >=, <, <=, &&, ||
 * Client-side operators: !=, contains, is-set, is-not-set
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreSearchRecordsWhereConditions } from '@qoretechnologies/ts-toolkit';

/**
 * Result of processing WHERE conditions.
 * Contains a server-side query string and a client-side filter function.
 */
export interface FreshdeskWhereResult {
  /** Freshdesk query string for server-side filtering (without outer quotes) */
  query: string | null;
  /** Client-side filter function for operators not supported by Freshdesk search */
  clientFilter: ((record: Record<string, unknown>) => boolean) | null;
}

/**
 * Format a value for Freshdesk query syntax
 */
const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value === 'number') {
    return String(value);
  }

  // String values need single quotes
  const strValue = String(value);

  // Check if it's a date
  const date = new Date(strValue);
  if (!isNaN(date.getTime()) && strValue.includes('-')) {
    return `'${date.toISOString().replace('.000Z', 'Z')}'`;
  }

  return `'${strValue}'`;
};

/**
 * Extract field name and value from expression args
 */
const extractFieldAndValue = (
  args: unknown[]
): { field: string; value: unknown } | null => {
  const fieldArg = args.find(
    (a) => typeof a === 'object' && a !== null && 'type_code' in a && (a as Record<string, unknown>).type_code === 'field reference'
  ) as Record<string, unknown> | undefined;

  const valueArg = args.find(
    (a) => typeof a === 'object' && a !== null && 'type_code' in a && (a as Record<string, unknown>).type_code === 'value'
  ) as Record<string, unknown> | undefined;

  if (!fieldArg || !('field' in fieldArg)) {
    return null;
  }

  return {
    field: fieldArg.field as string,
    value: valueArg ? valueArg.value : undefined,
  };
};

/**
 * Check if an expression is a server-side operator
 */
const isServerSideOperator = (exp: string): boolean => {
  return ['==', '>', '>=', '<', '<=', '&&', '||'].includes(exp);
};

/**
 * Build Freshdesk query string from a WHERE expression tree.
 * Only includes server-side operators; client-side operators are collected separately.
 */
const buildQueryFromExpression = (
  where: TQoreSearchRecordsWhereConditions,
  clientFilters: Array<(record: Record<string, unknown>) => boolean>
): string | null => {
  const exp = where.exp;
  const args = (where.args || []) as unknown[];

  // Handle logical operators
  if (exp === '&&' || exp === '||') {
    const parts: string[] = [];

    for (const arg of args) {
      if (typeof arg === 'object' && arg !== null && 'exp' in arg) {
        const part = buildQueryFromExpression(
          arg as TQoreSearchRecordsWhereConditions,
          clientFilters
        );
        if (part) {
          parts.push(part);
        }
      }
    }

    if (parts.length === 0) {
      return null;
    }

    if (parts.length === 1) {
      return parts[0];
    }

    const logicalOp = exp === '&&' ? 'AND' : 'OR';
    return `(${parts.join(` ${logicalOp} `)})`;
  }

  // Handle client-side operators
  if (!isServerSideOperator(exp)) {
    const extracted = extractFieldAndValue(args);
    if (!extracted) {
      return null;
    }

    const { field, value } = extracted;

    switch (exp) {
      case '!=':
        clientFilters.push((record) => record[field] !== value);
        break;
      case 'contains':
        clientFilters.push((record) => {
          const fieldValue = record[field];
          if (typeof fieldValue !== 'string' || typeof value !== 'string') {
            return false;
          }
          return fieldValue.toLowerCase().includes(value.toLowerCase());
        });
        break;
      case 'is-set':
        clientFilters.push((record) => {
          const fieldValue = record[field];
          return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
        });
        break;
      case 'is-not-set':
        clientFilters.push((record) => {
          const fieldValue = record[field];
          return fieldValue === null || fieldValue === undefined || fieldValue === '';
        });
        break;
    }

    return null;
  }

  // Handle comparison operators (server-side)
  const extracted = extractFieldAndValue(args);
  if (!extracted) {
    return null;
  }

  const { field, value } = extracted;
  const formattedValue = formatValue(value);

  switch (exp) {
    case '==':
      return `${field}:${formattedValue}`;
    case '>':
      return `${field}:>${formattedValue}`;
    case '>=':
      return `${field}:>${formattedValue}`;
    case '<':
      return `${field}:<${formattedValue}`;
    case '<=':
      return `${field}:<${formattedValue}`;
    default:
      return null;
  }
};

/**
 * Process Qore WHERE conditions into a Freshdesk query string and client-side filters.
 */
export const buildFreshdeskWhere = (
  where: TQoreSearchRecordsWhereConditions
): FreshdeskWhereResult => {
  const clientFilters: Array<(record: Record<string, unknown>) => boolean> = [];
  const query = buildQueryFromExpression(where, clientFilters);

  const combinedClientFilter =
    clientFilters.length > 0
      ? (record: Record<string, unknown>) => clientFilters.every((f) => f(record))
      : null;

  return {
    query,
    clientFilter: combinedClientFilter,
  };
};
