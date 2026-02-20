/**
 * SharePoint Apply Where Condition
 *
 * Translates Qore WHERE condition tree to Microsoft Graph OData $filter string.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import {
  isQoreRecordSearchExpression,
  isQoreRecordSearchFieldReference,
  TQoreSearchRecordsWhereConditions,
} from '@qoretechnologies/ts-toolkit';
import { SharePointRecordError } from './constants';

/**
 * Escape a string value for use in an OData filter expression.
 * Single quotes are escaped by doubling them.
 */
const escapeODataValue = (value: string): string => {
  return value.replace(/'/g, "''");
};

/**
 * Format a value for OData filter based on its type.
 * - Strings are wrapped in single quotes (dates arrive as ISO 8601 strings and are handled correctly)
 * - Numbers and booleans are used as-is
 */
const formatODataValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return `'${escapeODataValue(value)}'`;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (value === null || value === undefined) {
    return 'null';
  }
  return `'${escapeODataValue(String(value))}'`;
};

/**
 * Recursively build an OData $filter string from a Qore WHERE condition tree.
 */
export const buildODataFilter = (where: TQoreSearchRecordsWhereConditions): string => {
  const { exp, args } = where;

  // Handle logical operators
  if (exp === '&&' || exp === '||') {
    const odataOp = exp === '&&' ? 'and' : 'or';
    const parts: string[] = [];

    for (const arg of args) {
      if (isQoreRecordSearchExpression(arg)) {
        parts.push(buildODataFilter(arg));
      }
    }

    if (parts.length === 0) {
      return '';
    }
    if (parts.length === 1) {
      return parts[0];
    }

    return parts.map((p) => `(${p})`).join(` ${odataOp} `);
  }

  // Handle comparison operators - expect exactly 2 args: field reference + value
  if (['==', '!=', '>', '>=', '<', '<='].includes(exp)) {
    if (args.length !== 2) {
      throw new SharePointRecordError(
        `Operator "${exp}" requires exactly 2 arguments, got ${args.length}`
      );
    }

    const fieldArg = args[0];
    const valueArg = args[1];

    if (!isQoreRecordSearchFieldReference(fieldArg)) {
      throw new SharePointRecordError(`First argument to "${exp}" must be a field reference`);
    }

    const fieldName = `fields/${fieldArg.field}`;
    let value: unknown;

    if (isQoreRecordSearchFieldReference(valueArg)) {
      // Field-to-field comparison
      return `${fieldName} ${getODataOperator(exp)} fields/${valueArg.field}`;
    }

    value = 'value' in valueArg ? valueArg.value : undefined;

    return `${fieldName} ${getODataOperator(exp)} ${formatODataValue(value)}`;
  }

  // Handle string function operators
  if (exp === 'contains') {
    if (args.length !== 2) {
      throw new SharePointRecordError(
        `Operator "contains" requires exactly 2 arguments, got ${args.length}`
      );
    }

    const fieldArg = args[0];
    const valueArg = args[1];

    if (!isQoreRecordSearchFieldReference(fieldArg)) {
      throw new SharePointRecordError('First argument to "contains" must be a field reference');
    }

    const value = 'value' in valueArg ? valueArg.value : '';
    return `contains(fields/${fieldArg.field},'${escapeODataValue(String(value))}')`;
  }

  if (exp === 'starts-with') {
    if (args.length !== 2) {
      throw new SharePointRecordError(
        `Operator "starts-with" requires exactly 2 arguments, got ${args.length}`
      );
    }

    const fieldArg = args[0];
    const valueArg = args[1];

    if (!isQoreRecordSearchFieldReference(fieldArg)) {
      throw new SharePointRecordError('First argument to "starts-with" must be a field reference');
    }

    const value = 'value' in valueArg ? valueArg.value : '';
    return `startswith(fields/${fieldArg.field},'${escapeODataValue(String(value))}')`;
  }

  throw new SharePointRecordError(`Unsupported expression operator: "${exp}"`);
};

/**
 * Map Qore comparison operators to OData filter operators
 */
const getODataOperator = (qoreOp: string): string => {
  const operatorMap: Record<string, string> = {
    '==': 'eq',
    '!=': 'ne',
    '>': 'gt',
    '>=': 'ge',
    '<': 'lt',
    '<=': 'le',
  };

  const odataOp = operatorMap[qoreOp];
  if (!odataOp) {
    throw new SharePointRecordError(`Unsupported comparison operator: "${qoreOp}"`);
  }

  return odataOp;
};
