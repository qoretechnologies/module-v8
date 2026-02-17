/**
 * NetSuite Record-Based Helpers Tests
 *
 * Unit tests for expressions, search options, SQL escaping, WHERE clause building,
 * type inference, and data normalization.
 * Integration tests for full CRUD cycle with real NetSuite API.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { configDotenv } from 'dotenv';
import { buildSuiteQlWhereClause } from '../apps/netsuite/helpers/record-based/apply-where-condition';
import {
  clearFieldCache,
  escapeSqlIdentifier,
  escapeSqlValue,
  inferQoreTypeFromValue,
  MAX_PAGE_SIZE,
  NetsuiteRecordError,
  normalizeSetToSingleRecord,
  REST_OPERATION_DELAY,
} from '../apps/netsuite/helpers/record-based/constants';
import { createNetsuiteRecords } from '../apps/netsuite/helpers/record-based/create-records';
import { deleteNetsuiteRecords } from '../apps/netsuite/helpers/record-based/delete-records';
import { getNetsuiteExpressions } from '../apps/netsuite/helpers/record-based/get-expressions';
import { getNetsuiteRecordType } from '../apps/netsuite/helpers/record-based/get-record-type';
import { NetsuiteSearchOptions } from '../apps/netsuite/helpers/record-based/get-search-options';
import { getNetsuiteTableList } from '../apps/netsuite/helpers/record-based/get-table-list';
import { searchNetsuiteRecords } from '../apps/netsuite/helpers/record-based/search-records';
import { updateNetsuiteRecords } from '../apps/netsuite/helpers/record-based/update-records';
import { delay, mapColumnFormatToObject } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;

configDotenv({ path: '.env' });
// Skip integration tests because of the absence of credentials for NetSuite API.
describe('NetSuite Record-Based', () => {
  // ========================================================================
  // Unit Tests — no API access required
  // ========================================================================

  describe('Should test NetSuite expressions and search options (unit tests)', () => {
    it('Should return valid expressions configuration', () => {
      const expressions = getNetsuiteExpressions('en');

      expect(expressions).toBeDefined();
      expect(typeof expressions).toBe('object');

      // Logical operators
      expect(expressions['&&']).toBeDefined();
      expect(expressions['||']).toBeDefined();

      // Comparison operators
      expect(expressions['==']).toBeDefined();
      expect(expressions['!=']).toBeDefined();
      expect(expressions['>']).toBeDefined();
      expect(expressions['>=']).toBeDefined();
      expect(expressions['<']).toBeDefined();
      expect(expressions['<=']).toBeDefined();

      // Set operators
      expect(expressions['is-set']).toBeDefined();
      expect(expressions['is-not-set']).toBeDefined();

      // String operators
      expect(expressions['contains']).toBeDefined();
      expect(expressions['starts-with']).toBeDefined();
      expect(expressions['ends-with']).toBeDefined();
    });

    it('Should have correct structure for comparison operators', () => {
      const expressions = getNetsuiteExpressions('en');
      const eqExpr = expressions['=='];

      expect(eqExpr.type).toBe('operator');
      expect(eqExpr.roles).toContain('search');
      expect(eqExpr.args).toBeDefined();
      expect(eqExpr.args.length).toBe(2);
      expect(eqExpr.return_type).toBe('bool');
    });

    it('Should have correct structure for logical operators', () => {
      const expressions = getNetsuiteExpressions('en');
      const andExpr = expressions['&&'];

      expect(andExpr.type).toBe('operator');
      expect(andExpr.subtype).toBe('logic-operator');
      expect(andExpr.varargs).toBe(true);
    });

    it('Should have correct structure for set operators (unary)', () => {
      const expressions = getNetsuiteExpressions('en');
      const isSetExpr = expressions['is-set'];

      expect(isSetExpr.type).toBe('operator');
      expect(isSetExpr.args.length).toBe(1);
      expect(isSetExpr.return_type).toBe('bool');
    });

    it('Should have correct structure for string operators', () => {
      const expressions = getNetsuiteExpressions('en');
      const containsExpr = expressions['contains'];

      expect(containsExpr.type).toBe('operator');
      expect(containsExpr.args.length).toBe(2);
      expect(containsExpr.args[0].type).toBe('string');
      expect(containsExpr.args[1].type).toBe('string');
    });

    it('Should have exactly 13 expressions', () => {
      const expressions = getNetsuiteExpressions('en');
      expect(Object.keys(expressions).length).toBe(13);
    });

    it('Should have valid search options configuration', () => {
      expect(NetsuiteSearchOptions).toBeDefined();
      expect(NetsuiteSearchOptions.orderBy).toBeDefined();

      const orderByType = NetsuiteSearchOptions.orderBy.type as {
        type: string;
        fields: Record<string, any>;
      };

      expect(orderByType.type).toBe('hash');
      expect(orderByType.fields.field).toBeDefined();
      expect(orderByType.fields.direction).toBeDefined();
    });

    it('Should have common sort fields in orderBy allowed values', () => {
      const orderByType = NetsuiteSearchOptions.orderBy.type as {
        type: string;
        fields: Record<string, any>;
      };

      const allowedValues = orderByType.fields.field.allowed_values;
      const values = allowedValues.map((av: any) => av.value);

      expect(values).toContain('id');
      expect(values).toContain('datecreated');
      expect(values).toContain('lastmodifieddate');
      expect(values).toContain('name');
    });

    it('Should allow custom sort fields via allowed_values_creatable', () => {
      const orderByType = NetsuiteSearchOptions.orderBy.type as {
        type: string;
        fields: Record<string, any>;
      };

      expect(orderByType.fields.field.allowed_values_creatable).toBe(true);
    });

    it('Should have asc and desc direction options', () => {
      const orderByType = NetsuiteSearchOptions.orderBy.type as {
        type: string;
        fields: Record<string, any>;
      };

      const dirValues = orderByType.fields.direction.allowed_values.map((av: any) => av.value);
      expect(dirValues).toContain('asc');
      expect(dirValues).toContain('desc');
      expect(orderByType.fields.direction.default_value).toBe('asc');
    });
  });

  // ========================================================================
  // SQL Escaping Unit Tests
  // ========================================================================

  describe('Should test SQL value escaping (unit tests)', () => {
    it('Should escape string values with single quotes', () => {
      expect(escapeSqlValue('test')).toBe("'test'");
    });

    it('Should double single quotes inside strings', () => {
      expect(escapeSqlValue("O'Brien")).toBe("'O''Brien'");
      expect(escapeSqlValue("it's a 'test'")).toBe("'it''s a ''test'''");
    });

    it('Should handle null and undefined as NULL', () => {
      expect(escapeSqlValue(null)).toBe('NULL');
      expect(escapeSqlValue(undefined)).toBe('NULL');
    });

    it('Should handle numbers as-is', () => {
      expect(escapeSqlValue(42)).toBe('42');
      expect(escapeSqlValue(3.14)).toBe('3.14');
      expect(escapeSqlValue(0)).toBe('0');
      expect(escapeSqlValue(-100)).toBe('-100');
    });

    it('Should handle booleans with NetSuite T/F convention', () => {
      expect(escapeSqlValue(true)).toBe("'T'");
      expect(escapeSqlValue(false)).toBe("'F'");
    });

    it('Should throw on invalid numbers (Infinity, NaN)', () => {
      expect(() => escapeSqlValue(Infinity)).toThrow('Invalid numeric value');
      expect(() => escapeSqlValue(-Infinity)).toThrow('Invalid numeric value');
      expect(() => escapeSqlValue(NaN)).toThrow('Invalid numeric value');
    });

    it('Should handle empty string', () => {
      expect(escapeSqlValue('')).toBe("''");
    });

    it('Should convert non-string objects to string', () => {
      expect(escapeSqlValue({ toString: () => 'custom' })).toBe("'custom'");
    });
  });

  describe('Should test SQL identifier escaping (unit tests)', () => {
    it('Should validate safe identifiers', () => {
      expect(escapeSqlIdentifier('customer')).toBe('customer');
      expect(escapeSqlIdentifier('table_name')).toBe('table_name');
      expect(escapeSqlIdentifier('field.subfield')).toBe('field.subfield');
      expect(escapeSqlIdentifier('customrecord_mytype')).toBe('customrecord_mytype');
    });

    it('Should allow alphanumeric, underscores, and dots', () => {
      expect(escapeSqlIdentifier('abc123')).toBe('abc123');
      expect(escapeSqlIdentifier('my_field_1')).toBe('my_field_1');
      expect(escapeSqlIdentifier('a.b.c')).toBe('a.b.c');
    });

    it('Should throw on SQL injection attempts', () => {
      expect(() => escapeSqlIdentifier('field; DROP TABLE')).toThrow('Invalid SQL identifier');
      expect(() => escapeSqlIdentifier("field' OR '1'='1")).toThrow('Invalid SQL identifier');
      expect(() => escapeSqlIdentifier('field--comment')).toThrow('Invalid SQL identifier');
      expect(() => escapeSqlIdentifier('field/*comment*/')).toThrow('Invalid SQL identifier');
    });

    it('Should throw on empty string', () => {
      expect(() => escapeSqlIdentifier('')).toThrow('Invalid SQL identifier');
    });

    it('Should throw on whitespace', () => {
      expect(() => escapeSqlIdentifier('my field')).toThrow('Invalid SQL identifier');
      expect(() => escapeSqlIdentifier('field\n')).toThrow('Invalid SQL identifier');
    });

    it('Should throw on special characters', () => {
      expect(() => escapeSqlIdentifier('field=')).toThrow('Invalid SQL identifier');
      expect(() => escapeSqlIdentifier('field(')).toThrow('Invalid SQL identifier');
      expect(() => escapeSqlIdentifier('field)')).toThrow('Invalid SQL identifier');
    });
  });

  // ========================================================================
  // Type Inference Unit Tests
  // ========================================================================

  describe('Should test type inference from values (unit tests)', () => {
    it('Should infer string type', () => {
      expect(inferQoreTypeFromValue('hello')).toBe('string');
      expect(inferQoreTypeFromValue('')).toBe('string');
    });

    it('Should infer number type', () => {
      expect(inferQoreTypeFromValue(42)).toBe('number');
      expect(inferQoreTypeFromValue(3.14)).toBe('number');
      expect(inferQoreTypeFromValue(0)).toBe('number');
      expect(inferQoreTypeFromValue(-100)).toBe('number');
    });

    it('Should infer bool type', () => {
      expect(inferQoreTypeFromValue(true)).toBe('bool');
      expect(inferQoreTypeFromValue(false)).toBe('bool');
    });

    it('Should infer date type from ISO 8601 format', () => {
      expect(inferQoreTypeFromValue('2026-01-15')).toBe('date');
      expect(inferQoreTypeFromValue('2026-01-15T10:30:00')).toBe('date');
    });

    it('Should infer date type from US date format', () => {
      expect(inferQoreTypeFromValue('1/15/2026')).toBe('date');
      expect(inferQoreTypeFromValue('12/31/2026')).toBe('date');
    });

    it('Should infer list type from arrays', () => {
      const result = inferQoreTypeFromValue([1, 2, 3]);
      expect(result).toEqual({ type: 'list', element_type: 'any' });
    });

    it('Should infer any type from objects', () => {
      expect(inferQoreTypeFromValue({ key: 'val' })).toBe('any');
    });

    it('Should default null and undefined to string', () => {
      expect(inferQoreTypeFromValue(null)).toBe('string');
      expect(inferQoreTypeFromValue(undefined)).toBe('string');
    });

    it('Should not confuse regular strings with dates', () => {
      expect(inferQoreTypeFromValue('hello world')).toBe('string');
      expect(inferQoreTypeFromValue('not-a-date')).toBe('string');
      expect(inferQoreTypeFromValue('abc123')).toBe('string');
    });
  });

  // ========================================================================
  // Data Normalization Unit Tests
  // ========================================================================

  describe('Should test normalizeSetToSingleRecord (unit tests)', () => {
    const mockMapColumnFormat = (data: Record<string, unknown>): Record<string, unknown>[] => {
      const keys = Object.keys(data);
      if (keys.length === 0) return [];
      const length = (data[keys[0]] as unknown[]).length;
      const result: Record<string, unknown>[] = [];
      for (let i = 0; i < length; i++) {
        const record: Record<string, unknown> = {};
        for (const key of keys) {
          record[key] = (data[key] as unknown[])[i];
        }
        result.push(record);
      }
      return result;
    };

    it('Should normalize column format to single record', () => {
      const input = { name: ['John'], email: ['john@test.com'] };
      const result = normalizeSetToSingleRecord(input, mockMapColumnFormat);
      expect(result).toEqual({ name: 'John', email: 'john@test.com' });
    });

    it('Should handle array input by returning first element', () => {
      const input = [
        { name: 'John', email: 'john@test.com' },
        { name: 'Jane', email: 'jane@test.com' },
      ];
      const result = normalizeSetToSingleRecord(input, mockMapColumnFormat);
      expect(result).toEqual({ name: 'John', email: 'john@test.com' });
    });

    it('Should handle empty array', () => {
      const result = normalizeSetToSingleRecord([], mockMapColumnFormat);
      expect(result).toEqual({});
    });

    it('Should handle plain object (non-column format)', () => {
      const input = { name: 'John', email: 'john@test.com' };
      const result = normalizeSetToSingleRecord(input, mockMapColumnFormat);
      expect(result).toEqual({ name: 'John', email: 'john@test.com' });
    });

    it('Should handle null/undefined input', () => {
      expect(normalizeSetToSingleRecord(null, mockMapColumnFormat)).toEqual({});
      expect(normalizeSetToSingleRecord(undefined, mockMapColumnFormat)).toEqual({});
    });
  });

  // ========================================================================
  // WHERE Clause Building Unit Tests
  // ========================================================================

  describe('Should test WHERE clause building (unit tests)', () => {
    it('Should return empty string for undefined WHERE', () => {
      expect(buildSuiteQlWhereClause(undefined)).toBe('');
    });

    it('Should return empty string for empty WHERE', () => {
      expect(buildSuiteQlWhereClause({} as any)).toBe('');
    });

    it('Should convert equality expression (==)', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'name' },
          { type_code: 'value', value: 'Test' },
        ],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe("name = 'Test'");
    });

    it('Should convert not-equal expression (!=)', () => {
      const where = {
        exp: '!=',
        args: [
          { type_code: 'field reference', field: 'status' },
          { type_code: 'value', value: 'closed' },
        ],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe("status != 'closed'");
    });

    it('Should convert greater-than expression (>)', () => {
      const where = {
        exp: '>',
        args: [
          { type_code: 'field reference', field: 'amount' },
          { type_code: 'value', value: 100 },
        ],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe('amount > 100');
    });

    it('Should convert greater-than-or-equal expression (>=)', () => {
      const where = {
        exp: '>=',
        args: [
          { type_code: 'field reference', field: 'quantity' },
          { type_code: 'value', value: 5 },
        ],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe('quantity >= 5');
    });

    it('Should convert less-than expression (<)', () => {
      const where = {
        exp: '<',
        args: [
          { type_code: 'field reference', field: 'balance' },
          { type_code: 'value', value: 0 },
        ],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe('balance < 0');
    });

    it('Should convert less-than-or-equal expression (<=)', () => {
      const where = {
        exp: '<=',
        args: [
          { type_code: 'field reference', field: 'discount' },
          { type_code: 'value', value: 50 },
        ],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe('discount <= 50');
    });

    it('Should convert is-set expression to IS NOT NULL', () => {
      const where = {
        exp: 'is-set',
        args: [{ type_code: 'field reference', field: 'email' }],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe('email IS NOT NULL');
    });

    it('Should convert is-not-set expression to IS NULL', () => {
      const where = {
        exp: 'is-not-set',
        args: [{ type_code: 'field reference', field: 'phone' }],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe('phone IS NULL');
    });

    it('Should convert contains expression to LIKE with wildcards', () => {
      const where = {
        exp: 'contains',
        args: [
          { type_code: 'field reference', field: 'companyname' },
          { type_code: 'value', value: 'Corp' },
        ],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe("companyname LIKE '%Corp%'");
    });

    it('Should convert starts-with expression to LIKE with trailing wildcard', () => {
      const where = {
        exp: 'starts-with',
        args: [
          { type_code: 'field reference', field: 'entityid' },
          { type_code: 'value', value: 'CUST' },
        ],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe("entityid LIKE 'CUST%'");
    });

    it('Should convert ends-with expression to LIKE with leading wildcard', () => {
      const where = {
        exp: 'ends-with',
        args: [
          { type_code: 'field reference', field: 'email' },
          { type_code: 'value', value: '@example.com' },
        ],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe("email LIKE '%@example.com'");
    });

    it('Should handle AND (&&) conditions', () => {
      const where = {
        exp: '&&',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'entityid' },
              { type_code: 'value', value: 'CUST001' },
            ],
          },
          {
            exp: 'is-set',
            args: [{ type_code: 'field reference', field: 'email' }],
          },
        ],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe("(entityid = 'CUST001' AND email IS NOT NULL)");
    });

    it('Should handle OR (||) conditions', () => {
      const where = {
        exp: '||',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: 'active' },
            ],
          },
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: 'pending' },
            ],
          },
        ],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe("(status = 'active' OR status = 'pending')");
    });

    it('Should handle nested AND/OR conditions', () => {
      const where = {
        exp: '&&',
        args: [
          {
            exp: '||',
            args: [
              {
                exp: '==',
                args: [
                  { type_code: 'field reference', field: 'status' },
                  { type_code: 'value', value: 'active' },
                ],
              },
              {
                exp: '==',
                args: [
                  { type_code: 'field reference', field: 'status' },
                  { type_code: 'value', value: 'pending' },
                ],
              },
            ],
          },
          {
            exp: '>',
            args: [
              { type_code: 'field reference', field: 'balance' },
              { type_code: 'value', value: 0 },
            ],
          },
        ],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe(
        "((status = 'active' OR status = 'pending') AND balance > 0)"
      );
    });

    it('Should escape values with single quotes in WHERE conditions', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'companyname' },
          { type_code: 'value', value: "O'Brien Corp" },
        ],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe("companyname = 'O''Brien Corp'");
    });

    it('Should handle numeric values in WHERE conditions', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'id' },
          { type_code: 'value', value: 12345 },
        ],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe('id = 12345');
    });

    it('Should handle boolean values with T/F convention', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'isinactive' },
          { type_code: 'value', value: false },
        ],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe("isinactive = 'F'");
    });

    it('Should convert == null to IS NULL', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'email' },
          { type_code: 'value', value: null },
        ],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe('email IS NULL');
    });

    it('Should convert != null to IS NOT NULL', () => {
      const where = {
        exp: '!=',
        args: [
          { type_code: 'field reference', field: 'email' },
          { type_code: 'value', value: null },
        ],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe('email IS NOT NULL');
    });

    it('Should convert == undefined to IS NULL', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'phone' },
          { type_code: 'value', value: undefined },
        ],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe('phone IS NULL');
    });

    it('Should return empty string for missing field reference', () => {
      const where = {
        exp: '==',
        args: [{ type_code: 'value', value: 'test' }],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe('');
    });

    it('Should return empty string for unknown expression type', () => {
      const where = {
        exp: 'unknown-op',
        args: [
          { type_code: 'field reference', field: 'name' },
          { type_code: 'value', value: 'test' },
        ],
      } as any;

      expect(buildSuiteQlWhereClause(where)).toBe('');
    });
  });

  // ========================================================================
  // Constants Unit Tests
  // ========================================================================

  describe('Should test constants (unit tests)', () => {
    it('Should have correct MAX_PAGE_SIZE', () => {
      expect(MAX_PAGE_SIZE).toBe(1000);
    });

    it('Should have correct REST_OPERATION_DELAY', () => {
      expect(REST_OPERATION_DELAY).toBe(300);
    });

    it('Should have NetsuiteRecordError with correct name', () => {
      const error = new NetsuiteRecordError('test error');
      expect(error.name).toBe('NetsuiteRecordError');
      expect(error.message).toBe('test error');
      expect(error instanceof Error).toBe(true);
    });
  });

  // ========================================================================
  // Integration Tests — require NetSuite credentials
  // ========================================================================

  describe.skip('Should test NetSuite record-based helpers (integration tests)', () => {
    const base_context = {
      conn_opts: {
        token: '',
        account_id: '',
      } as Record<string, string>,
    };

    let hasCredentials = false;

    beforeAll(async () => {
      const accountId = process.env.NETSUITE_ACCOUNT_ID;

      // Support direct access token or refresh token flow
      const accessToken = process.env.NETSUITE_ACCESS_TOKEN;
      const refreshToken = process.env.NETSUITE_REFRESH_TOKEN;
      const clientId = process.env.NETSUITE_CLIENT_ID;
      const clientSecret = process.env.NETSUITE_CLIENT_SECRET;

      if (!accountId) {
        console.warn('NETSUITE_ACCOUNT_ID not set, skipping integration tests');
        return;
      }

      // If a direct access token is provided, use it directly
      if (accessToken) {
        hasCredentials = true;
        base_context.conn_opts.token = accessToken;
        base_context.conn_opts.account_id = accountId;
        return;
      }

      // Otherwise, try refresh token flow
      if (!refreshToken || !clientId || !clientSecret) {
        console.warn(
          'NETSUITE_ACCESS_TOKEN or NETSUITE_REFRESH_TOKEN + NETSUITE_CLIENT_ID + ' +
            'NETSUITE_CLIENT_SECRET not set, skipping integration tests'
        );
        return;
      }

      // Exchange refresh token for access token
      const data: Record<string, string> = {
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
      };

      const basicToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      const formBody = Object.keys(data)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
        .join('&');

      const tokenUrl = `https://${accountId}.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token`;

      try {
        const response = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${basicToken}`,
          },
          body: formBody,
        });

        const responseData = (await response.json()) as Record<string, unknown>;

        if (!responseData?.access_token) {
          console.error('Failed to get access token:', responseData);
          console.warn('Skipping integration tests — could not obtain access token');
          return;
        }

        hasCredentials = true;
        base_context.conn_opts.token = responseData.access_token as string;
        base_context.conn_opts.account_id = accountId;
      } catch (error) {
        console.error('Failed to refresh OAuth token:', error);
        console.warn('Skipping integration tests — token refresh failed');
      }
    });

    afterEach(async () => {
      if (hasCredentials) {
        await delay(500);
      }
    });

    beforeEach(() => {
      clearFieldCache();
    });

    let testCustomerId: string | undefined;
    let customerFields: string[] = [];

    it('Should get table list', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: credentials not set');
        return;
      }

      const tables = await getNetsuiteTableList(base_context);

      expect(tables).toBeDefined();
      expect(Array.isArray(tables)).toBe(true);
      expect(tables.length).toBeGreaterThan(0);
      expect(tables).toContain('customer');
      expect(tables).toContain('vendor');

      // Verify all entries are non-empty strings
      for (const table of tables) {
        expect(typeof table).toBe('string');
        expect(table.length).toBeGreaterThan(0);
      }
    }, 30000);

    it('Should get record type for customer and discover fields', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: credentials not set');
        return;
      }

      const recordType = await getNetsuiteRecordType(base_context, 'customer');

      expect(recordType).toBeDefined();
      expect(recordType.type).toBe('hash');

      if (recordType.type !== 'hash' || !('fields' in recordType) || !recordType.fields) {
        throw new Error('Record type should be a hash with fields');
      }

      // customer table must have these standard NetSuite fields
      expect(recordType.fields.id).toBeDefined();
      expect(recordType.fields.companyname).toBeDefined();
      expect(recordType.fields.isinactive).toBeDefined();

      // Save discovered field names for validating search results
      customerFields = Object.keys(recordType.fields);
      expect(customerFields.length).toBeGreaterThan(5);

      // Each field should have a type
      for (const [fieldName, fieldDef] of Object.entries(recordType.fields)) {
        expect(fieldDef).toHaveProperty('type');
        expect(fieldDef).toHaveProperty('desc');
        expect(typeof fieldName).toBe('string');
      }
    }, 30000);

    it('Should get record type for vendor', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: credentials not set');
        return;
      }

      const recordType = await getNetsuiteRecordType(base_context, 'vendor');

      expect(recordType).toBeDefined();
      expect(recordType.type).toBe('hash');

      if (recordType.type !== 'hash' || !('fields' in recordType) || !recordType.fields) {
        throw new Error('Record type should be a hash with fields');
      }

      expect(recordType.fields.id).toBeDefined();
      expect(Object.keys(recordType.fields).length).toBeGreaterThan(5);
    }, 30000);

    it('Should search customers with no filter and return known fields', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: credentials not set');
        return;
      }

      const iterator = await searchNetsuiteRecords(base_context, undefined, {
        table: 'customer',
      });

      expect(iterator).toBeDefined();
      expect(typeof iterator).toBe('function');

      const batch = await iterator(base_context, 10);

      expect(batch).not.toBeNull();
      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);
        expect(records.length).toBeGreaterThan(0);

        // Verify returned records have the fields discovered by get_record_type
        const returnedFields = Object.keys(records[0]);
        expect(returnedFields).toContain('id');
        expect(returnedFields).toContain('companyname');

        if (customerFields.length > 0) {
          // All fields in search results should be known from the schema
          for (const field of returnedFields) {
            expect(customerFields).toContain(field);
          }
        }

        // Every record should have an id
        for (const record of records) {
          expect(record.id).toBeDefined();
          expect(record.id).not.toBeNull();
        }

        // Save a customer ID for later tests
        testCustomerId = String(records[0].id);
      }
    }, 60000);

    it('Should search customers with == filter and return exactly one match', async () => {
      if (!hasCredentials || !testCustomerId) {
        console.warn('Skipping: credentials not set or no test customer');
        return;
      }

      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'id' },
          { type_code: 'value', value: testCustomerId },
        ],
      } as any;

      const iterator = await searchNetsuiteRecords(base_context, where, {
        table: 'customer',
      });

      const batch = await iterator(base_context, 10);

      expect(batch).not.toBeNull();
      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(records.length).toBe(1);
        expect(String(records[0].id)).toBe(testCustomerId);

        // Verify the record has expected customer fields
        expect(records[0]).toHaveProperty('companyname');
        expect(records[0]).toHaveProperty('isinactive');
      }
    }, 60000);

    it('Should search with is-set filter and return only records with companyname', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: credentials not set');
        return;
      }

      const where = {
        exp: 'is-set',
        args: [{ type_code: 'field reference', field: 'companyname' }],
      } as any;

      const iterator = await searchNetsuiteRecords(base_context, where, {
        table: 'customer',
      });

      const batch = await iterator(base_context, 10);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);
        expect(records.length).toBeGreaterThan(0);

        // Every returned record must have a non-null companyname (the filter guarantees this)
        for (const record of records) {
          expect(record.companyname).toBeDefined();
          expect(record.companyname).not.toBeNull();
          expect(String(record.companyname).length).toBeGreaterThan(0);
        }
      }
    }, 60000);

    it('Should search with AND conditions and verify both conditions hold', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: credentials not set');
        return;
      }

      const where = {
        exp: '&&',
        args: [
          {
            exp: 'is-set',
            args: [{ type_code: 'field reference', field: 'companyname' }],
          },
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'isinactive' },
              { type_code: 'value', value: false },
            ],
          },
        ],
      } as any;

      const iterator = await searchNetsuiteRecords(base_context, where, {
        table: 'customer',
      });

      const batch = await iterator(base_context, 10);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);
        expect(records.length).toBeGreaterThan(0);

        // Verify both conditions hold for every returned record
        for (const record of records) {
          // companyname IS NOT NULL
          expect(record.companyname).toBeDefined();
          expect(record.companyname).not.toBeNull();
          // isinactive == 'F' (NetSuite stores booleans as T/F)
          expect(record.isinactive).toBe('F');
        }
      }
    }, 60000);

    it('Should search with orderBy and return records in descending id order', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: credentials not set');
        return;
      }

      const iterator = await searchNetsuiteRecords(base_context, undefined, {
        table: 'customer',
        orderBy: { field: 'id', direction: 'desc' },
      });

      expect(iterator).toBeDefined();
      const batch = await iterator(base_context, 10);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);
        expect(records.length).toBeGreaterThan(0);

        // Verify descending order: each id should be >= the next
        for (let i = 0; i < records.length - 1; i++) {
          expect(Number(records[i].id)).toBeGreaterThanOrEqual(Number(records[i + 1].id));
        }
      }
    }, 60000);

    it('Should search and paginate with iterator', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: credentials not set');
        return;
      }

      const iterator = await searchNetsuiteRecords(base_context, undefined, {
        table: 'customer',
        limit: 5,
      });

      const batch1 = await iterator(base_context, 3);
      expect(batch1).not.toBeNull();
      if (batch1) {
        const records1 = mapColumnFormatToObject(batch1);
        expect(records1.length).toBeLessThanOrEqual(3);

        // Verify each record has an id
        for (const record of records1) {
          expect(record.id).toBeDefined();
        }

        if (records1.length === 3) {
          const batch2 = await iterator(base_context, 3);
          if (batch2) {
            const records2 = mapColumnFormatToObject(batch2);
            expect(records2.length).toBeLessThanOrEqual(2);

            // Verify no duplicate IDs between batches
            const batch1Ids = records1.map((r) => String(r.id));
            const batch2Ids = records2.map((r) => String(r.id));
            for (const id of batch2Ids) {
              expect(batch1Ids).not.toContain(id);
            }
          }
        }
      }
    }, 60000);

    it('Should return null when no records match search', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: credentials not set');
        return;
      }

      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'id' },
          { type_code: 'value', value: '999999999' },
        ],
      } as any;

      const iterator = await searchNetsuiteRecords(base_context, where, {
        table: 'customer',
      });

      const batch = await iterator(base_context, 10);
      expect(batch).toBeNull();
    }, 60000);

    // --- Error path tests (use dummy context so connection validation passes) ---

    const dummyContext = {
      conn_opts: { token: 'dummy-token', account_id: 'dummy-account' },
    };

    it('Should throw when deleting without WHERE condition', async () => {
      await expect(async () => {
        await deleteNetsuiteRecords(dummyContext, undefined, { table: 'vendor' });
      }).rejects.toThrow(/WHERE condition is required/);
    }, 30000);

    it('Should throw when table name is missing', async () => {
      await expect(async () => {
        await searchNetsuiteRecords(dummyContext, undefined, {} as any);
      }).rejects.toThrow(/Table name is required/);

      await expect(async () => {
        await createNetsuiteRecords(dummyContext, { name: ['test'] }, {} as any);
      }).rejects.toThrow(/Table name is required/);

      await expect(async () => {
        await updateNetsuiteRecords(
          dummyContext,
          { name: 'test' },
          { exp: '==', args: [] } as any,
          {} as any
        );
      }).rejects.toThrow(/Table name is required/);

      await expect(async () => {
        await deleteNetsuiteRecords(dummyContext, { exp: '==', args: [] } as any, {} as any);
      }).rejects.toThrow(/Table name is required/);
    }, 30000);
  });

  // ========================================================================
  // CRUD Integration Tests — require NetSuite sandbox credentials
  // ========================================================================

  describe.skip('Should test NetSuite CRUD operations (integration tests)', () => {
    const base_context = {
      conn_opts: {
        token: '',
        account_id: '',
      } as Record<string, string>,
    };

    let hasCredentials = false;
    let createdVendorId: string | undefined;
    const testVendorName = `QoreTest_Vendor_${Date.now()}`;

    beforeAll(async () => {
      const accountId = process.env.NETSUITE_ACCOUNT_ID;
      const accessToken = process.env.NETSUITE_ACCESS_TOKEN;
      const refreshToken = process.env.NETSUITE_REFRESH_TOKEN;
      const clientId = process.env.NETSUITE_CLIENT_ID;
      const clientSecret = process.env.NETSUITE_CLIENT_SECRET;

      if (!accountId) {
        console.warn('NETSUITE_ACCOUNT_ID not set, skipping CRUD integration tests');
        return;
      }

      if (accessToken) {
        hasCredentials = true;
        base_context.conn_opts.token = accessToken;
        base_context.conn_opts.account_id = accountId;
        return;
      }

      if (!refreshToken || !clientId || !clientSecret) {
        console.warn('No credentials available, skipping CRUD integration tests');
        return;
      }

      const data: Record<string, string> = {
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
      };

      const basicToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const formBody = Object.keys(data)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
        .join('&');

      const tokenUrl = `https://${accountId}.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token`;

      try {
        const response = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${basicToken}`,
          },
          body: formBody,
        });

        const responseData = (await response.json()) as Record<string, unknown>;

        if (!responseData?.access_token) {
          console.warn('Skipping CRUD integration tests — could not obtain access token');
          return;
        }

        hasCredentials = true;
        base_context.conn_opts.token = responseData.access_token as string;
        base_context.conn_opts.account_id = accountId;
      } catch (error) {
        console.warn('Skipping CRUD integration tests — token refresh failed');
      }
    });

    afterAll(async () => {
      // Cleanup: attempt to delete the test vendor even if tests failed
      if (hasCredentials && createdVendorId) {
        try {
          const where = {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'id' },
              { type_code: 'value', value: createdVendorId },
            ],
          } as any;

          await deleteNetsuiteRecords(base_context, where, { table: 'vendor' });
          Debugger.log(`Cleaned up test vendor ${createdVendorId}`);
        } catch (cleanupError) {
          Debugger.log(`Failed to clean up test vendor ${createdVendorId}: ${cleanupError}`);
        }
      }
    });

    afterEach(async () => {
      if (hasCredentials) {
        await delay(500);
      }
    });

    it('Should create a vendor record', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: credentials not set');
        return;
      }

      // NetSuite vendors require companyname and subsidiary
      const vendorData = {
        companyname: [testVendorName],
        subsidiary: [{ id: '1' }],
        comments: ['Created by Qore automated test'],
      };

      const result = await createNetsuiteRecords(base_context, vendorData, {
        table: 'vendor',
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');

      // Result is in column format
      expect(result.id).toBeDefined();
      expect(Array.isArray(result.id)).toBe(true);
      expect(result.id.length).toBe(1);

      createdVendorId = String(result.id[0]);
      expect(createdVendorId).not.toBe('');
      expect(createdVendorId).not.toBe('unknown');

      Debugger.log(`Created test vendor with ID: ${createdVendorId}`);
    }, 60000);

    it('Should search and find the created vendor by ID', async () => {
      if (!hasCredentials || !createdVendorId) {
        console.warn('Skipping: credentials not set or vendor not created');
        return;
      }

      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'id' },
          { type_code: 'value', value: createdVendorId },
        ],
      } as any;

      const iterator = await searchNetsuiteRecords(base_context, where, {
        table: 'vendor',
      });

      const batch = await iterator(base_context, 10);

      expect(batch).not.toBeNull();
      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(records.length).toBe(1);
        expect(String(records[0].id)).toBe(createdVendorId);
        expect(records[0].companyname).toBe(testVendorName);
      }
    }, 60000);

    it('Should search and find the created vendor by companyname using contains', async () => {
      if (!hasCredentials || !createdVendorId) {
        console.warn('Skipping: credentials not set or vendor not created');
        return;
      }

      const where = {
        exp: 'contains',
        args: [
          { type_code: 'field reference', field: 'companyname' },
          { type_code: 'value', value: 'QoreTest_Vendor_' },
        ],
      } as any;

      const iterator = await searchNetsuiteRecords(base_context, where, {
        table: 'vendor',
      });

      const batch = await iterator(base_context, 100);

      expect(batch).not.toBeNull();
      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(records.length).toBeGreaterThanOrEqual(1);

        // Our created vendor should be in the results
        const ourVendor = records.find((r) => String(r.id) === createdVendorId);
        expect(ourVendor).toBeDefined();
        expect(ourVendor?.companyname).toBe(testVendorName);
      }
    }, 60000);

    it('Should update the created vendor', async () => {
      if (!hasCredentials || !createdVendorId) {
        console.warn('Skipping: credentials not set or vendor not created');
        return;
      }

      const updatedComment = 'Updated by Qore automated test';
      const updateSet = { comments: updatedComment };
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'id' },
          { type_code: 'value', value: createdVendorId },
        ],
      } as any;

      const updatedCount = await updateNetsuiteRecords(base_context, updateSet, where, {
        table: 'vendor',
      });

      expect(updatedCount).toBe(1);
    }, 60000);

    it('Should verify the update by searching the vendor', async () => {
      if (!hasCredentials || !createdVendorId) {
        console.warn('Skipping: credentials not set or vendor not created');
        return;
      }

      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'id' },
          { type_code: 'value', value: createdVendorId },
        ],
      } as any;

      const iterator = await searchNetsuiteRecords(base_context, where, {
        table: 'vendor',
      });

      const batch = await iterator(base_context, 10);

      expect(batch).not.toBeNull();
      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(records.length).toBe(1);
        expect(String(records[0].id)).toBe(createdVendorId);
        // companyname should be unchanged
        expect(records[0].companyname).toBe(testVendorName);
      }
    }, 60000);

    it('Should update 0 records when WHERE matches nothing', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: credentials not set');
        return;
      }

      const updateSet = { comments: 'should not update anything' };
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'id' },
          { type_code: 'value', value: '999999999' },
        ],
      } as any;

      const updatedCount = await updateNetsuiteRecords(base_context, updateSet, where, {
        table: 'vendor',
      });

      expect(updatedCount).toBe(0);
    }, 60000);

    it('Should delete the created vendor', async () => {
      if (!hasCredentials || !createdVendorId) {
        console.warn('Skipping: credentials not set or vendor not created');
        return;
      }

      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'id' },
          { type_code: 'value', value: createdVendorId },
        ],
      } as any;

      const deletedCount = await deleteNetsuiteRecords(base_context, where, {
        table: 'vendor',
      });

      expect(deletedCount).toBe(1);

      // Mark as deleted so afterAll cleanup doesn't try again
      createdVendorId = undefined;
    }, 60000);

    it('Should verify the vendor is deleted by searching for it', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: credentials not set');
        return;
      }

      // Use the test vendor name to search — should return no results
      const where = {
        exp: 'contains',
        args: [
          { type_code: 'field reference', field: 'companyname' },
          { type_code: 'value', value: testVendorName },
        ],
      } as any;

      const iterator = await searchNetsuiteRecords(base_context, where, {
        table: 'vendor',
      });

      const batch = await iterator(base_context, 10);

      // Either null (no results) or empty batch
      if (batch) {
        const records = mapColumnFormatToObject(batch);
        // Our specific vendor should not be found
        const ourVendor = records.find((r) => r.companyname === testVendorName);
        expect(ourVendor).toBeUndefined();
      }
    }, 60000);

    it('Should delete 0 records when WHERE matches nothing', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: credentials not set');
        return;
      }

      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'id' },
          { type_code: 'value', value: '999999999' },
        ],
      } as any;

      const deletedCount = await deleteNetsuiteRecords(base_context, where, {
        table: 'vendor',
      });

      expect(deletedCount).toBe(0);
    }, 60000);
  });
});
