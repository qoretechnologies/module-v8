/**
 * QuickBooks Record-Based Helpers Tests
 *
 * Unit tests for expressions, search options, WHERE conversion, and client-side filtering.
 * Integration tests for full CRUD cycle with real QuickBooks Sandbox API.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { configDotenv } from 'dotenv';
import {
  buildQuickbooksCriteria,
  filterRecordsClientSide,
  getNestedValue,
} from '../apps/quickbooks/helpers/record-based/apply-where-condition';
import {
  BATCH_SIZE,
  ENTITY_CAPABILITIES,
  ENTITY_FIELD_DEFINITIONS,
  getEntityFromQueryResponse,
  getFindMethodName,
  MAX_PAGE_SIZE,
  QuickbooksRecordError,
  SORTABLE_FIELDS,
  SUPPORTED_ENTITIES,
  validateEntityType,
} from '../apps/quickbooks/helpers/record-based/constants';
import { createQuickbooksRecords } from '../apps/quickbooks/helpers/record-based/create-records';
import { deleteQuickbooksRecords } from '../apps/quickbooks/helpers/record-based/delete-records';
import { getQuickbooksExpressions } from '../apps/quickbooks/helpers/record-based/get-expressions';
import { getQuickbooksRecordType } from '../apps/quickbooks/helpers/record-based/get-record-type';
import { QuickbooksSearchOptions } from '../apps/quickbooks/helpers/record-based/get-search-options';
import { getQuickbooksTableList } from '../apps/quickbooks/helpers/record-based/get-table-list';
import { searchQuickbooksRecords } from '../apps/quickbooks/helpers/record-based/search-records';
import { updateQuickbooksRecords } from '../apps/quickbooks/helpers/record-based/update-records';
import { delay, mapColumnFormatToObject } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;

configDotenv({ path: '.env' });

describe('QuickBooks Record-Based', () => {
  // ========================================================================
  // Unit Tests — no API access required
  // ========================================================================

  describe('Should test QuickBooks expressions and search options (unit tests)', () => {
    it('Should return valid expressions configuration', () => {
      const expressions = getQuickbooksExpressions('en');

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
    });

    it('Should have correct structure for comparison operators', () => {
      const expressions = getQuickbooksExpressions('en');
      const eqExpr = expressions['=='];

      expect(eqExpr.type).toBe('operator');
      expect(eqExpr.roles).toContain('search');
      expect(eqExpr.args).toBeDefined();
      expect(eqExpr.args.length).toBe(2);
      expect(eqExpr.return_type).toBe('bool');
    });

    it('Should have correct structure for logical operators', () => {
      const expressions = getQuickbooksExpressions('en');
      const andExpr = expressions['&&'];

      expect(andExpr.type).toBe('operator');
      expect(andExpr.subtype).toBe('logic-operator');
      expect(andExpr.varargs).toBe(true);
    });

    it('Should have valid search options configuration', () => {
      expect(QuickbooksSearchOptions).toBeDefined();
      expect(QuickbooksSearchOptions.orderBy).toBeDefined();

      const orderByType = QuickbooksSearchOptions.orderBy.type as {
        type: string;
        fields: Record<string, unknown>;
      };
      expect(orderByType.type).toBe('hash');

      const orderByFields = orderByType.fields as Record<string, Record<string, unknown>>;
      expect(orderByFields).toBeDefined();
      expect(orderByFields.field).toBeDefined();
      expect(orderByFields.direction).toBeDefined();

      // Direction should have asc/desc
      const dirValues = (orderByFields.direction.allowed_values as { value: string }[]).map(
        (v) => v.value
      );
      expect(dirValues).toContain('asc');
      expect(dirValues).toContain('desc');
    });
  });

  describe('Should test QuickBooks constants (unit tests)', () => {
    it('Should have all 19 supported entities', () => {
      expect(SUPPORTED_ENTITIES).toBeDefined();
      expect(SUPPORTED_ENTITIES.length).toBe(19);

      expect(SUPPORTED_ENTITIES).toContain('Customer');
      expect(SUPPORTED_ENTITIES).toContain('Vendor');
      expect(SUPPORTED_ENTITIES).toContain('Invoice');
      expect(SUPPORTED_ENTITIES).toContain('Bill');
      expect(SUPPORTED_ENTITIES).toContain('Estimate');
      expect(SUPPORTED_ENTITIES).toContain('Item');
      expect(SUPPORTED_ENTITIES).toContain('Payment');
      expect(SUPPORTED_ENTITIES).toContain('Account');
      expect(SUPPORTED_ENTITIES).toContain('CreditMemo');
      expect(SUPPORTED_ENTITIES).toContain('Deposit');
      expect(SUPPORTED_ENTITIES).toContain('JournalEntry');
      expect(SUPPORTED_ENTITIES).toContain('PurchaseOrder');
      expect(SUPPORTED_ENTITIES).toContain('Purchase');
      expect(SUPPORTED_ENTITIES).toContain('RefundReceipt');
      expect(SUPPORTED_ENTITIES).toContain('SalesReceipt');
      expect(SUPPORTED_ENTITIES).toContain('Employee');
      expect(SUPPORTED_ENTITIES).toContain('BillPayment');
      expect(SUPPORTED_ENTITIES).toContain('VendorCredit');
      expect(SUPPORTED_ENTITIES).toContain('Transfer');
    });

    it('Should have capabilities defined for all entities', () => {
      for (const entity of SUPPORTED_ENTITIES) {
        const caps = ENTITY_CAPABILITIES[entity];
        expect(caps).toBeDefined();
        expect(typeof caps.create).toBe('boolean');
        expect(typeof caps.update).toBe('boolean');
        expect(typeof caps.delete).toBe('boolean');
        expect(typeof caps.query).toBe('boolean');
      }
    });

    it('Should mark non-deletable entities correctly', () => {
      // These entities don't support deletion — only deactivation
      expect(ENTITY_CAPABILITIES['Customer'].delete).toBe(false);
      expect(ENTITY_CAPABILITIES['Vendor'].delete).toBe(false);
      expect(ENTITY_CAPABILITIES['Item'].delete).toBe(false);
      expect(ENTITY_CAPABILITIES['Account'].delete).toBe(false);
      expect(ENTITY_CAPABILITIES['Employee'].delete).toBe(false);
    });

    it('Should have field definitions for all entities', () => {
      for (const entity of SUPPORTED_ENTITIES) {
        const fields = ENTITY_FIELD_DEFINITIONS[entity];
        expect(fields).toBeDefined();
        expect(typeof fields).toBe('object');
        // All entities should have at least Id and SyncToken
        expect(fields.Id).toBeDefined();
        expect(fields.SyncToken).toBeDefined();
      }
    });

    it('Should have sortable fields for all entities', () => {
      for (const entity of SUPPORTED_ENTITIES) {
        const sortable = SORTABLE_FIELDS[entity];
        expect(sortable).toBeDefined();
        expect(Array.isArray(sortable)).toBe(true);
        expect(sortable.length).toBeGreaterThan(0);
      }
    });

    it('Should have correct batch size and page size constants', () => {
      expect(BATCH_SIZE).toBe(25);
      expect(MAX_PAGE_SIZE).toBe(1000);
    });

    it('Should generate correct find method names', () => {
      expect(getFindMethodName('Customer')).toBe('findCustomers');
      expect(getFindMethodName('Invoice')).toBe('findInvoices');
      expect(getFindMethodName('JournalEntry')).toBe('findJournalEntrys');
    });

    it('Should validate entity types correctly', () => {
      expect(validateEntityType('Customer')).toBe('Customer');
      expect(validateEntityType('Invoice')).toBe('Invoice');
      expect(() => validateEntityType('NonExistent')).toThrow(QuickbooksRecordError);
    });

    it('Should extract entities from query response', () => {
      const response = {
        QueryResponse: {
          Customer: [{ Id: '1', DisplayName: 'Test' }],
          totalCount: 1,
        },
      };

      const entities = getEntityFromQueryResponse(response, 'Customer');
      expect(entities).toEqual([{ Id: '1', DisplayName: 'Test' }]);
    });

    it('Should return empty array when no entities in response', () => {
      const response = { QueryResponse: {} };
      const entities = getEntityFromQueryResponse(response, 'Customer');
      expect(entities).toEqual([]);
    });

    it('Should return empty array for null response', () => {
      const entities = getEntityFromQueryResponse({} as Record<string, unknown>, 'Customer');
      expect(entities).toEqual([]);
    });
  });

  describe('Should test QuickBooks table list and record type (unit tests)', () => {
    it('Should return all supported entities as table list', async () => {
      const tables = await getQuickbooksTableList({} as any);

      expect(tables).toBeDefined();
      expect(Array.isArray(tables)).toBe(true);
      expect(tables.length).toBe(19);
      expect(tables).toContain('Customer');
      expect(tables).toContain('Invoice');
      expect(tables).toContain('Bill');
    });

    it('Should return record type for Customer', async () => {
      const recordType = await getQuickbooksRecordType({} as any, 'Customer');

      expect(recordType).toBeDefined();
      expect(recordType.type).toBe('hash');

      if (recordType.type !== 'hash' || !('fields' in recordType) || !recordType.fields) {
        throw new Error('Record type should be a hash with fields');
      }

      const { fields } = recordType;
      expect(fields.Id).toBeDefined();
      expect(fields.SyncToken).toBeDefined();
      expect(fields.DisplayName).toBeDefined();
    });

    it('Should return record type for Invoice', async () => {
      const recordType = await getQuickbooksRecordType({} as any, 'Invoice');

      expect(recordType).toBeDefined();
      expect(recordType.type).toBe('hash');

      if (recordType.type !== 'hash' || !('fields' in recordType) || !recordType.fields) {
        throw new Error('Record type should be a hash with fields');
      }

      const { fields } = recordType;
      expect(fields.Id).toBeDefined();
      expect(fields.TotalAmt).toBeDefined();
      expect(fields.CustomerRef).toBeDefined();
    });

    it('Should throw for unknown entity type', async () => {
      await expect(async () => {
        await getQuickbooksRecordType({} as any, 'UnknownEntity');
      }).rejects.toThrow(QuickbooksRecordError);
    });
  });

  describe('Should test QuickBooks WHERE to CriteriaItem conversion (unit tests)', () => {
    it('Should convert equality expression to CriteriaItem', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'DisplayName' },
          { type_code: 'value', value: 'John Doe' },
        ],
      } as any;

      const { criteria, clientSideFilter } = buildQuickbooksCriteria(where);

      expect(criteria.length).toBe(1);
      expect(criteria[0].field).toBe('DisplayName');
      expect(criteria[0].value).toBe('John Doe');
      expect(criteria[0].operator).toBe('=');
      expect(clientSideFilter).toBeUndefined();
    });

    it('Should convert greater-than expression', () => {
      const where = {
        exp: '>',
        args: [
          { type_code: 'field reference', field: 'TotalAmt' },
          { type_code: 'value', value: 100 },
        ],
      } as any;

      const { criteria } = buildQuickbooksCriteria(where);

      expect(criteria.length).toBe(1);
      expect(criteria[0].field).toBe('TotalAmt');
      expect(criteria[0].value).toBe('100');
      expect(criteria[0].operator).toBe('>');
    });

    it('Should convert greater-than-or-equal expression', () => {
      const where = {
        exp: '>=',
        args: [
          { type_code: 'field reference', field: 'Balance' },
          { type_code: 'value', value: 50 },
        ],
      } as any;

      const { criteria } = buildQuickbooksCriteria(where);

      expect(criteria.length).toBe(1);
      expect(criteria[0].operator).toBe('>=');
    });

    it('Should convert less-than expression', () => {
      const where = {
        exp: '<',
        args: [
          { type_code: 'field reference', field: 'TotalAmt' },
          { type_code: 'value', value: 500 },
        ],
      } as any;

      const { criteria } = buildQuickbooksCriteria(where);

      expect(criteria.length).toBe(1);
      expect(criteria[0].operator).toBe('<');
    });

    it('Should convert less-than-or-equal expression', () => {
      const where = {
        exp: '<=',
        args: [
          { type_code: 'field reference', field: 'Balance' },
          { type_code: 'value', value: 200 },
        ],
      } as any;

      const { criteria } = buildQuickbooksCriteria(where);

      expect(criteria.length).toBe(1);
      expect(criteria[0].operator).toBe('<=');
    });

    it('Should convert contains expression to LIKE with wildcards', () => {
      const where = {
        exp: 'contains',
        args: [
          { type_code: 'field reference', field: 'DisplayName' },
          { type_code: 'value', value: 'John' },
        ],
      } as any;

      const { criteria } = buildQuickbooksCriteria(where);

      expect(criteria.length).toBe(1);
      expect(criteria[0].field).toBe('DisplayName');
      expect(criteria[0].value).toBe('%John%');
      expect(criteria[0].operator).toBe('LIKE');
    });

    it('Should convert starts-with expression to LIKE with trailing wildcard', () => {
      const where = {
        exp: 'starts-with',
        args: [
          { type_code: 'field reference', field: 'DisplayName' },
          { type_code: 'value', value: 'Jo' },
        ],
      } as any;

      const { criteria } = buildQuickbooksCriteria(where);

      expect(criteria.length).toBe(1);
      expect(criteria[0].value).toBe('Jo%');
      expect(criteria[0].operator).toBe('LIKE');
    });

    it('Should combine AND conditions into multiple CriteriaItems', () => {
      const where = {
        exp: '&&',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'Active' },
              { type_code: 'value', value: 'true' },
            ],
          },
          {
            exp: '>',
            args: [
              { type_code: 'field reference', field: 'Balance' },
              { type_code: 'value', value: 0 },
            ],
          },
        ],
      } as any;

      const { criteria, clientSideFilter } = buildQuickbooksCriteria(where);

      expect(criteria.length).toBe(2);
      expect(criteria[0].field).toBe('Active');
      expect(criteria[0].operator).toBe('=');
      expect(criteria[1].field).toBe('Balance');
      expect(criteria[1].operator).toBe('>');
      expect(clientSideFilter).toBeUndefined();
    });

    it('Should push OR conditions to client-side filter', () => {
      const where = {
        exp: '||',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'DisplayName' },
              { type_code: 'value', value: 'Alice' },
            ],
          },
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'DisplayName' },
              { type_code: 'value', value: 'Bob' },
            ],
          },
        ],
      } as any;

      const { criteria, clientSideFilter } = buildQuickbooksCriteria(where);

      expect(criteria.length).toBe(0);
      expect(clientSideFilter).toBeDefined();
      expect(clientSideFilter?.exp).toBe('||');
    });

    it('Should push != conditions to client-side filter', () => {
      const where = {
        exp: '!=',
        args: [
          { type_code: 'field reference', field: 'Active' },
          { type_code: 'value', value: 'false' },
        ],
      } as any;

      const { criteria, clientSideFilter } = buildQuickbooksCriteria(where);

      expect(criteria.length).toBe(0);
      expect(clientSideFilter).toBeDefined();
      expect(clientSideFilter?.exp).toBe('!=');
    });

    it('Should push is-set conditions to client-side filter', () => {
      const where = {
        exp: 'is-set',
        args: [{ type_code: 'field reference', field: 'PrimaryEmailAddr' }],
      } as any;

      const { criteria, clientSideFilter } = buildQuickbooksCriteria(where);

      expect(criteria.length).toBe(0);
      expect(clientSideFilter).toBeDefined();
    });

    it('Should push is-not-set conditions to client-side filter', () => {
      const where = {
        exp: 'is-not-set',
        args: [{ type_code: 'field reference', field: 'PrimaryPhone' }],
      } as any;

      const { criteria, clientSideFilter } = buildQuickbooksCriteria(where);

      expect(criteria.length).toBe(0);
      expect(clientSideFilter).toBeDefined();
    });

    it('Should handle mixed server-side and client-side conditions', () => {
      const where = {
        exp: '&&',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'Active' },
              { type_code: 'value', value: 'true' },
            ],
          },
          {
            exp: '!=',
            args: [
              { type_code: 'field reference', field: 'DisplayName' },
              { type_code: 'value', value: 'Test' },
            ],
          },
        ],
      } as any;

      const { criteria, clientSideFilter } = buildQuickbooksCriteria(where);

      expect(criteria.length).toBe(1);
      expect(criteria[0].field).toBe('Active');
      expect(clientSideFilter).toBeDefined();
      expect(clientSideFilter?.exp).toBe('!=');
    });

    it('Should return empty criteria for undefined WHERE', () => {
      const { criteria, clientSideFilter } = buildQuickbooksCriteria(undefined);

      expect(criteria.length).toBe(0);
      expect(clientSideFilter).toBeUndefined();
    });

    it('Should handle deeply nested AND conditions', () => {
      const where = {
        exp: '&&',
        args: [
          {
            exp: '&&',
            args: [
              {
                exp: '==',
                args: [
                  { type_code: 'field reference', field: 'Active' },
                  { type_code: 'value', value: 'true' },
                ],
              },
              {
                exp: '>',
                args: [
                  { type_code: 'field reference', field: 'Balance' },
                  { type_code: 'value', value: 0 },
                ],
              },
            ],
          },
          {
            exp: '<',
            args: [
              { type_code: 'field reference', field: 'Balance' },
              { type_code: 'value', value: 1000 },
            ],
          },
        ],
      } as any;

      const { criteria } = buildQuickbooksCriteria(where);

      expect(criteria.length).toBe(3);
    });
  });

  describe('Should test QuickBooks client-side filtering (unit tests)', () => {
    const mockRecords = [
      { Id: '1', DisplayName: 'Alice Smith', Balance: 100, Active: true, Email: 'alice@test.com' },
      { Id: '2', DisplayName: 'Bob Jones', Balance: 200, Active: false, Email: null },
      { Id: '3', DisplayName: 'Charlie Brown', Balance: 0, Active: true, Email: '' },
      { Id: '4', DisplayName: 'Diana Prince', Balance: 500, Active: true, Email: 'diana@test.com' },
    ];

    it('Should filter with == operator', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'Active' },
          { type_code: 'value', value: true },
        ],
      } as any;

      const filtered = filterRecordsClientSide(mockRecords, where);
      expect(filtered.length).toBe(3);
    });

    it('Should filter with != operator', () => {
      const where = {
        exp: '!=',
        args: [
          { type_code: 'field reference', field: 'DisplayName' },
          { type_code: 'value', value: 'Alice Smith' },
        ],
      } as any;

      const filtered = filterRecordsClientSide(mockRecords, where);
      expect(filtered.length).toBe(3);
      expect(filtered.every((r) => r.DisplayName !== 'Alice Smith')).toBe(true);
    });

    it('Should filter with > operator', () => {
      const where = {
        exp: '>',
        args: [
          { type_code: 'field reference', field: 'Balance' },
          { type_code: 'value', value: 100 },
        ],
      } as any;

      const filtered = filterRecordsClientSide(mockRecords, where);
      expect(filtered.length).toBe(2);
      expect(filtered.every((r) => (r.Balance as number) > 100)).toBe(true);
    });

    it('Should filter with >= operator', () => {
      const where = {
        exp: '>=',
        args: [
          { type_code: 'field reference', field: 'Balance' },
          { type_code: 'value', value: 200 },
        ],
      } as any;

      const filtered = filterRecordsClientSide(mockRecords, where);
      expect(filtered.length).toBe(2);
    });

    it('Should filter with < operator', () => {
      const where = {
        exp: '<',
        args: [
          { type_code: 'field reference', field: 'Balance' },
          { type_code: 'value', value: 200 },
        ],
      } as any;

      const filtered = filterRecordsClientSide(mockRecords, where);
      expect(filtered.length).toBe(2);
    });

    it('Should filter with <= operator', () => {
      const where = {
        exp: '<=',
        args: [
          { type_code: 'field reference', field: 'Balance' },
          { type_code: 'value', value: 100 },
        ],
      } as any;

      const filtered = filterRecordsClientSide(mockRecords, where);
      expect(filtered.length).toBe(2);
    });

    it('Should filter with contains operator', () => {
      const where = {
        exp: 'contains',
        args: [
          { type_code: 'field reference', field: 'DisplayName' },
          { type_code: 'value', value: 'smith' },
        ],
      } as any;

      const filtered = filterRecordsClientSide(mockRecords, where);
      expect(filtered.length).toBe(1);
      expect(filtered[0].DisplayName).toBe('Alice Smith');
    });

    it('Should filter with starts-with operator', () => {
      const where = {
        exp: 'starts-with',
        args: [
          { type_code: 'field reference', field: 'DisplayName' },
          { type_code: 'value', value: 'bob' },
        ],
      } as any;

      const filtered = filterRecordsClientSide(mockRecords, where);
      expect(filtered.length).toBe(1);
      expect(filtered[0].DisplayName).toBe('Bob Jones');
    });

    it('Should filter with is-set operator', () => {
      const where = {
        exp: 'is-set',
        args: [{ type_code: 'field reference', field: 'Email' }],
      } as any;

      const filtered = filterRecordsClientSide(mockRecords, where);
      expect(filtered.length).toBe(2);
      expect(filtered.every((r) => r.Email !== null && r.Email !== '' && r.Email !== undefined)).toBe(
        true
      );
    });

    it('Should filter with is-not-set operator', () => {
      const where = {
        exp: 'is-not-set',
        args: [{ type_code: 'field reference', field: 'Email' }],
      } as any;

      const filtered = filterRecordsClientSide(mockRecords, where);
      expect(filtered.length).toBe(2);
    });

    it('Should filter with AND (&&) operator', () => {
      const where = {
        exp: '&&',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'Active' },
              { type_code: 'value', value: true },
            ],
          },
          {
            exp: '>',
            args: [
              { type_code: 'field reference', field: 'Balance' },
              { type_code: 'value', value: 0 },
            ],
          },
        ],
      } as any;

      const filtered = filterRecordsClientSide(mockRecords, where);
      expect(filtered.length).toBe(2);
    });

    it('Should filter with OR (||) operator', () => {
      const where = {
        exp: '||',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'DisplayName' },
              { type_code: 'value', value: 'Alice Smith' },
            ],
          },
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'DisplayName' },
              { type_code: 'value', value: 'Bob Jones' },
            ],
          },
        ],
      } as any;

      const filtered = filterRecordsClientSide(mockRecords, where);
      expect(filtered.length).toBe(2);
    });

    it('Should return all records when WHERE is undefined', () => {
      const filtered = filterRecordsClientSide(mockRecords, undefined);
      expect(filtered.length).toBe(4);
    });

    it('Should return all records when condition has no exp', () => {
      const filtered = filterRecordsClientSide(mockRecords, {} as any);
      expect(filtered.length).toBe(4);
    });
  });

  describe('Should test getNestedValue utility (unit tests)', () => {
    it('Should get top-level value', () => {
      const obj = { Id: '123', DisplayName: 'Test' };
      expect(getNestedValue(obj, 'Id')).toBe('123');
      expect(getNestedValue(obj, 'DisplayName')).toBe('Test');
    });

    it('Should get nested value with dot notation', () => {
      const obj = {
        MetaData: { CreateTime: '2026-01-01T00:00:00Z', LastUpdatedTime: '2026-01-02T00:00:00Z' },
      };
      expect(getNestedValue(obj, 'MetaData.CreateTime')).toBe('2026-01-01T00:00:00Z');
      expect(getNestedValue(obj, 'MetaData.LastUpdatedTime')).toBe('2026-01-02T00:00:00Z');
    });

    it('Should return undefined for missing paths', () => {
      const obj = { Id: '123' };
      expect(getNestedValue(obj, 'NonExistent')).toBeUndefined();
      expect(getNestedValue(obj, 'MetaData.CreateTime')).toBeUndefined();
    });

    it('Should handle deeply nested paths', () => {
      const obj = { a: { b: { c: 'deep' } } };
      expect(getNestedValue(obj, 'a.b.c')).toBe('deep');
    });
  });

  // ========================================================================
  // Integration Tests — require QuickBooks sandbox credentials
  // ========================================================================

  describe('Should test QuickBooks record-based helpers (integration tests)', () => {
    const base_context = {
      conn_opts: {
        token: '',
        instance_type: 'sandbox',
        realm_id: '',
      } as Record<string, string>,
    };

    let hasCredentials = false;

    beforeAll(async () => {
      const refreshToken = process.env.QUICKBOOKS_REFRESH_TOKEN;
      const realmId = process.env.QUICKBOOKS_REALM_ID;
      const clientId = process.env.QUICKBOOKS_CLIENT_ID;
      const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;

      if (!refreshToken || !realmId || !clientId || !clientSecret) {
        console.warn(
          'QUICKBOOKS_REFRESH_TOKEN, QUICKBOOKS_REALM_ID, QUICKBOOKS_CLIENT_ID, or ' +
            'QUICKBOOKS_CLIENT_SECRET not set, skipping integration tests'
        );
        return;
      }

      // Exchange refresh token for access token
      const data = {
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      };

      const basicToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      const formBody = Object.keys(data)
        .map(
          (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key as keyof typeof data])}`
        )
        .join('&');

      const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
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
      base_context.conn_opts.realm_id = realmId;
    });

    afterEach(async () => {
      if (hasCredentials) {
        await delay(500);
      }
    });

    // Track created records for cleanup
    let createdInvoiceId: string | undefined;
    let testCustomerId: string | undefined;

    it(
      'Should get table list',
      async () => {
        if (!hasCredentials) {
          console.warn('Skipping: credentials not set');
          return;
        }

        const tables = await getQuickbooksTableList(base_context);

        expect(tables).toBeDefined();
        expect(Array.isArray(tables)).toBe(true);
        expect(tables.length).toBe(19);
        expect(tables).toContain('Customer');
        expect(tables).toContain('Invoice');
      },
      30000
    );

    it(
      'Should get record type for Customer',
      async () => {
        if (!hasCredentials) {
          console.warn('Skipping: credentials not set');
          return;
        }

        const recordType = await getQuickbooksRecordType(base_context, 'Customer');

        expect(recordType).toBeDefined();
        expect(recordType.type).toBe('hash');

        if (recordType.type !== 'hash' || !('fields' in recordType) || !recordType.fields) {
          throw new Error('Record type should be a hash with fields');
        }

        expect(recordType.fields.Id).toBeDefined();
        expect(recordType.fields.DisplayName).toBeDefined();
      },
      30000
    );

    it(
      'Should throw for unknown entity type',
      async () => {
        if (!hasCredentials) {
          console.warn('Skipping: credentials not set');
          return;
        }

        await expect(async () => {
          await getQuickbooksRecordType(base_context, 'InvalidEntity');
        }).rejects.toThrow(QuickbooksRecordError);
      },
      30000
    );

    it(
      'Should search customers with no filter',
      async () => {
        if (!hasCredentials) {
          console.warn('Skipping: credentials not set');
          return;
        }

        const iterator = await searchQuickbooksRecords(base_context, undefined, {
          table: 'Customer',
        });

        expect(iterator).toBeDefined();
        expect(typeof iterator).toBe('function');

        const batch = await iterator(base_context, 10);

        if (batch) {
          const records = mapColumnFormatToObject(batch);
          expect(Array.isArray(records)).toBe(true);

          if (records.length > 0) {
            expect(records[0].Id).toBeDefined();
            expect(records[0].DisplayName).toBeDefined();

            // Save a customer ID for later tests
            testCustomerId = records[0].Id as string;
          }
        }
      },
      60000
    );

    it(
      'Should search customers with == filter',
      async () => {
        if (!hasCredentials || !testCustomerId) {
          console.warn('Skipping: credentials not set or no test customer');
          return;
        }

        const where = {
          exp: '==',
          args: [
            { type_code: 'field reference', field: 'Id' },
            { type_code: 'value', value: testCustomerId },
          ],
        } as any;

        const iterator = await searchQuickbooksRecords(base_context, where, {
          table: 'Customer',
        });

        const batch = await iterator(base_context, 10);

        expect(batch).not.toBeNull();
        if (batch) {
          const records = mapColumnFormatToObject(batch);
          expect(records.length).toBe(1);
          expect(records[0].Id).toBe(testCustomerId);
        }
      },
      60000
    );

    it(
      'Should search customers with contains filter',
      async () => {
        if (!hasCredentials) {
          console.warn('Skipping: credentials not set');
          return;
        }

        // Search for customers with 'a' in their name (very common)
        const where = {
          exp: 'contains',
          args: [
            { type_code: 'field reference', field: 'DisplayName' },
            { type_code: 'value', value: 'a' },
          ],
        } as any;

        const iterator = await searchQuickbooksRecords(base_context, where, {
          table: 'Customer',
        });

        const batch = await iterator(base_context, 10);

        if (batch) {
          const records = mapColumnFormatToObject(batch);
          expect(Array.isArray(records)).toBe(true);
          // All returned records should contain 'a' in their name (case-insensitive is done server side via LIKE)
        }
      },
      60000
    );

    it(
      'Should search customers with AND conditions',
      async () => {
        if (!hasCredentials) {
          console.warn('Skipping: credentials not set');
          return;
        }

        const where = {
          exp: '&&',
          args: [
            {
              exp: 'contains',
              args: [
                { type_code: 'field reference', field: 'DisplayName' },
                { type_code: 'value', value: '' },
              ],
            },
            {
              exp: '>=',
              args: [
                { type_code: 'field reference', field: 'Balance' },
                { type_code: 'value', value: 0 },
              ],
            },
          ],
        } as any;

        const iterator = await searchQuickbooksRecords(base_context, where, {
          table: 'Customer',
        });

        const batch = await iterator(base_context, 10);

        if (batch) {
          const records = mapColumnFormatToObject(batch);
          expect(Array.isArray(records)).toBe(true);
        }
      },
      60000
    );

    it(
      'Should search accounts with orderBy',
      async () => {
        if (!hasCredentials) {
          console.warn('Skipping: credentials not set');
          return;
        }

        const iterator = await searchQuickbooksRecords(base_context, undefined, {
          table: 'Account',
          orderBy: { field: 'Name', direction: 'asc' },
        });

        expect(iterator).toBeDefined();
        const batch = await iterator(base_context, 10);

        if (batch) {
          const records = mapColumnFormatToObject(batch);
          expect(Array.isArray(records)).toBe(true);
        }
      },
      60000
    );

    it(
      'Should create a customer record',
      async () => {
        if (!hasCredentials) {
          console.warn('Skipping: credentials not set');
          return;
        }

        const timestamp = Date.now();
        const records = {
          DisplayName: [`RecordTest Customer ${timestamp}`],
          CompanyName: [`Test Company ${timestamp}`],
          PrimaryEmailAddr: [{ Address: `test-${timestamp}@example.com` }],
        };

        const result = await createQuickbooksRecords(base_context, records, {
          table: 'Customer',
        });

        expect(result).toBeDefined();
        expect(result.Id).toBeDefined();
        expect(Array.isArray(result.Id)).toBe(true);
        expect(result.Id.length).toBe(1);

        // Save for later cleanup/tests
        testCustomerId = result.Id[0] as string;
      },
      60000
    );

    it(
      'Should update a customer record',
      async () => {
        if (!hasCredentials || !testCustomerId) {
          console.warn('Skipping: credentials not set or no test customer');
          return;
        }

        const timestamp = Date.now();
        const updateSet = {
          CompanyName: `Updated Company ${timestamp}`,
        };

        const where = {
          exp: '==',
          args: [
            { type_code: 'field reference', field: 'Id' },
            { type_code: 'value', value: testCustomerId },
          ],
        } as any;

        const updatedCount = await updateQuickbooksRecords(base_context, updateSet, where, {
          table: 'Customer',
        });

        expect(updatedCount).toBe(1);

        // Verify the update by searching
        await delay(1000);
        const iterator = await searchQuickbooksRecords(base_context, where, {
          table: 'Customer',
        });

        const batch = await iterator(base_context, 10);

        if (batch) {
          const records = mapColumnFormatToObject(batch);
          expect(records.length).toBe(1);
          expect(records[0].CompanyName).toBe(`Updated Company ${timestamp}`);
        }
      },
      120000
    );

    it(
      'Should return 0 when updating with empty set',
      async () => {
        if (!hasCredentials || !testCustomerId) {
          console.warn('Skipping: credentials not set or no test customer');
          return;
        }

        const where = {
          exp: '==',
          args: [
            { type_code: 'field reference', field: 'Id' },
            { type_code: 'value', value: testCustomerId },
          ],
        } as any;

        const updatedCount = await updateQuickbooksRecords(base_context, {}, where, {
          table: 'Customer',
        });

        expect(updatedCount).toBe(0);
      },
      60000
    );

    it(
      'Should return 0 when deleting non-matching records',
      async () => {
        if (!hasCredentials) {
          console.warn('Skipping: credentials not set');
          return;
        }

        const where = {
          exp: '==',
          args: [
            { type_code: 'field reference', field: 'Id' },
            { type_code: 'value', value: '999999999' },
          ],
        } as any;

        const deletedCount = await deleteQuickbooksRecords(base_context, where, {
          table: 'Invoice',
        });

        expect(deletedCount).toBe(0);
      },
      60000
    );

    it(
      'Should throw when deleting entity that does not support deletion',
      async () => {
        if (!hasCredentials) {
          console.warn('Skipping: credentials not set');
          return;
        }

        const where = {
          exp: '==',
          args: [
            { type_code: 'field reference', field: 'Id' },
            { type_code: 'value', value: '1' },
          ],
        } as any;

        await expect(async () => {
          await deleteQuickbooksRecords(base_context, where, { table: 'Customer' });
        }).rejects.toThrow(/does not support deletion/);
      },
      30000
    );

    it(
      'Should throw when deleting without WHERE condition',
      async () => {
        if (!hasCredentials) {
          console.warn('Skipping: credentials not set');
          return;
        }

        await expect(async () => {
          await deleteQuickbooksRecords(base_context, undefined, { table: 'Invoice' });
        }).rejects.toThrow(/WHERE condition is required/);
      },
      30000
    );

    it(
      'Should throw when table name is missing',
      async () => {
        if (!hasCredentials) {
          console.warn('Skipping: credentials not set');
          return;
        }

        await expect(async () => {
          await searchQuickbooksRecords(base_context, undefined, {} as any);
        }).rejects.toThrow(/Table name is required/);

        await expect(async () => {
          await createQuickbooksRecords(base_context, { Name: ['test'] }, {} as any);
        }).rejects.toThrow(/Table name is required/);

        await expect(async () => {
          await updateQuickbooksRecords(
            base_context,
            { Name: 'test' },
            { exp: '==', args: [] } as any,
            {} as any
          );
        }).rejects.toThrow(/Table name is required/);

        await expect(async () => {
          await deleteQuickbooksRecords(
            base_context,
            { exp: '==', args: [] } as any,
            {} as any
          );
        }).rejects.toThrow(/Table name is required/);
      },
      30000
    );

    it(
      'Should create and then delete an invoice',
      async () => {
        if (!hasCredentials) {
          console.warn('Skipping: credentials not set');
          return;
        }

        // First, we need a customer to create an invoice for
        // Search for an existing customer
        const customerIterator = await searchQuickbooksRecords(base_context, undefined, {
          table: 'Customer',
          limit: 1,
        });

        const customerBatch = await customerIterator(base_context, 1);

        if (!customerBatch) {
          console.warn('No customers found, skipping invoice create/delete test');
          return;
        }

        const customers = mapColumnFormatToObject(customerBatch);

        if (customers.length === 0) {
          console.warn('No customers found, skipping invoice create/delete test');
          return;
        }

        const customerId = customers[0].Id as string;

        // Create an invoice
        const invoiceRecords = {
          CustomerRef: [{ value: customerId }],
          Line: [
            [
              {
                Amount: 100,
                DetailType: 'SalesItemLineDetail',
                SalesItemLineDetail: {
                  ItemRef: { value: '1', name: 'Services' },
                },
              },
            ],
          ],
        };

        const createResult = await createQuickbooksRecords(base_context, invoiceRecords, {
          table: 'Invoice',
        });

        expect(createResult).toBeDefined();
        expect(createResult.Id).toBeDefined();
        expect(Array.isArray(createResult.Id)).toBe(true);
        expect(createResult.Id.length).toBe(1);

        createdInvoiceId = createResult.Id[0] as string;

        // Wait for the record to be committed
        await delay(2000);

        // Now delete the invoice
        const where = {
          exp: '==',
          args: [
            { type_code: 'field reference', field: 'Id' },
            { type_code: 'value', value: createdInvoiceId },
          ],
        } as any;

        const deletedCount = await deleteQuickbooksRecords(base_context, where, {
          table: 'Invoice',
        });

        expect(deletedCount).toBe(1);
        createdInvoiceId = undefined; // Cleaned up
      },
      120000
    );

    it(
      'Should search items (products/services)',
      async () => {
        if (!hasCredentials) {
          console.warn('Skipping: credentials not set');
          return;
        }

        const iterator = await searchQuickbooksRecords(base_context, undefined, {
          table: 'Item',
        });

        expect(iterator).toBeDefined();
        const batch = await iterator(base_context, 10);

        if (batch) {
          const records = mapColumnFormatToObject(batch);
          expect(Array.isArray(records)).toBe(true);

          if (records.length > 0) {
            expect(records[0].Id).toBeDefined();
            expect(records[0].Name).toBeDefined();
          }
        }
      },
      60000
    );

    it(
      'Should handle pagination correctly',
      async () => {
        if (!hasCredentials) {
          console.warn('Skipping: credentials not set');
          return;
        }

        // Request a very small batch to force pagination
        const iterator = await searchQuickbooksRecords(base_context, undefined, {
          table: 'Account',
          limit: 100,
        });

        expect(iterator).toBeDefined();

        // Get first batch
        const batch1 = await iterator(base_context, 2);

        if (batch1) {
          const records1 = mapColumnFormatToObject(batch1);
          expect(records1.length).toBeLessThanOrEqual(2);

          // Get second batch
          const batch2 = await iterator(base_context, 2);

          if (batch2) {
            const records2 = mapColumnFormatToObject(batch2);
            expect(records2.length).toBeLessThanOrEqual(2);

            // Ensure different records returned (no overlap)
            if (records1.length > 0 && records2.length > 0) {
              expect(records1[0].Id).not.toBe(records2[0].Id);
            }
          }
        }
      },
      60000
    );

    // Cleanup: if any test-created records remain, attempt to clean up
    afterAll(async () => {
      if (!hasCredentials) {
        return;
      }

      // Attempt to clean up any remaining created invoice
      if (createdInvoiceId) {
        try {
          const where = {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'Id' },
              { type_code: 'value', value: createdInvoiceId },
            ],
          } as any;

          await deleteQuickbooksRecords(base_context, where, { table: 'Invoice' });
        } catch {
          // Ignore cleanup errors
        }
      }
    });
  });
});
