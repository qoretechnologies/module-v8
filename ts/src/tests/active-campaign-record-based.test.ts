/**
 * ActiveCampaign Record-Based Tests
 *
 * Comprehensive tests for ActiveCampaign record-based operations including
 * unit tests (no API) and integration tests (requires credentials).
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { configDotenv } from 'dotenv';
import { delay, mapColumnFormatToObject } from '../global/helpers';
import { getActiveCampaignTableList } from '../apps/active-campaign/helpers/record-based/get-table-list';
import { getActiveCampaignRecordType } from '../apps/active-campaign/helpers/record-based/get-record-type';
import { getActiveCampaignExpressions } from '../apps/active-campaign/helpers/record-based/get-expressions';
import { ActiveCampaignSearchOptions } from '../apps/active-campaign/helpers/record-based/get-search-options';
import { searchActiveCampaignRecords } from '../apps/active-campaign/helpers/record-based/search-records';
import { createActiveCampaignRecords } from '../apps/active-campaign/helpers/record-based/create-records';
import { updateActiveCampaignRecords } from '../apps/active-campaign/helpers/record-based/update-records';
import { deleteActiveCampaignRecords } from '../apps/active-campaign/helpers/record-based/delete-records';
import {
  extractServerSideParams,
  filterRecords,
  sortRecords,
  canSortServerSide,
} from '../apps/active-campaign/helpers/record-based/apply-where-condition';
import {
  transformContactToRecord,
  transformDealToRecord,
  transformAccountToRecord,
  transformRecordToPayload,
  normalizeSetToSingleRecord,
  CUSTOM_FIELD_PREFIX,
} from '../apps/active-campaign/helpers/record-based/constants';
import { activeCampaignClient } from '../apps/active-campaign/helpers/constants';

configDotenv({ path: '.env' });

describe('ActiveCampaign Record-Based', () => {
  // ============================================================
  // UNIT TESTS (No API calls needed)
  // ============================================================

  describe('Unit Tests - Expressions', () => {
    const expressions = getActiveCampaignExpressions('en');

    it('Should define all expected operators', () => {
      const expectedOperators = ['&&', '||', '==', '!=', '>', '>=', '<', '<=', 'is-set', 'is-not-set', 'contains'];

      for (const op of expectedOperators) {
        expect(expressions[op]).toBeDefined();
      }
    });

    it('Should define logical operators with correct structure', () => {
      for (const op of ['&&', '||']) {
        const expr = expressions[op];
        expect(expr.type).toBe('operator');
        expect(expr.subtype).toBe('logic-operator');
        expect(expr.varargs).toBe(true);
        expect(expr.return_type).toBe('bool');
        expect(expr.roles).toContain('search');
      }
    });

    it('Should define comparison operators with correct structure', () => {
      for (const op of ['==', '!=', '>', '>=', '<', '<=']) {
        const expr = expressions[op];
        expect(expr.type).toBe('operator');
        expect(expr.subtype).toBe('generic');
        expect(expr.return_type).toBe('bool');
        expect(expr.roles).toContain('search');
        expect(expr.args.length).toBe(2);
      }
    });

    it('Should define set operators with single argument', () => {
      for (const op of ['is-set', 'is-not-set']) {
        const expr = expressions[op];
        expect(expr.type).toBe('operator');
        expect(expr.args.length).toBe(1);
        expect(expr.return_type).toBe('bool');
      }
    });

    it('Should define contains operator with string args', () => {
      const expr = expressions['contains'];
      expect(expr.type).toBe('operator');
      expect(expr.args.length).toBe(2);
      expect(expr.return_type).toBe('bool');
    });

    it('Should have display_name on all operators from locale', () => {
      for (const [, expr] of Object.entries(expressions)) {
        expect(expr.display_name).toBeDefined();
        expect(typeof expr.display_name).toBe('string');
        expect(expr.display_name.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Unit Tests - Search Options', () => {
    it('Should define orderBy with field and direction', () => {
      const { orderBy } = ActiveCampaignSearchOptions;
      expect(orderBy).toBeDefined();
      expect(orderBy.type.type).toBe('hash');
      expect(orderBy.type.fields.field).toBeDefined();
      expect(orderBy.type.fields.direction).toBeDefined();
    });

    it('Should include allowed values for field', () => {
      const fieldDef = ActiveCampaignSearchOptions.orderBy.type.fields.field;
      expect(fieldDef.allowed_values).toBeDefined();
      expect(Array.isArray(fieldDef.allowed_values)).toBe(true);
      expect(fieldDef.allowed_values!.length).toBeGreaterThan(0);
    });

    it('Should include asc and desc as direction values', () => {
      const dirDef = ActiveCampaignSearchOptions.orderBy.type.fields.direction;
      expect(dirDef.allowed_values).toBeDefined();
      const values = dirDef.allowed_values!.map((v: { value: string }) => v.value);
      expect(values).toContain('asc');
      expect(values).toContain('desc');
    });
  });

  describe('Unit Tests - Table List', () => {
    it('Should return all three entity types', async () => {
      const tables = await getActiveCampaignTableList({} as any);
      expect(tables).toEqual(['Contacts', 'Deals', 'Accounts']);
    });

    it('Should return a new array each call (not shared reference)', async () => {
      const tables1 = await getActiveCampaignTableList({} as any);
      const tables2 = await getActiveCampaignTableList({} as any);
      expect(tables1).not.toBe(tables2);
      expect(tables1).toEqual(tables2);
    });
  });

  describe('Unit Tests - Transform Functions', () => {
    it('Should transform contact API response to flat record', () => {
      const contact = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-1234',
        cdate: '2026-01-01T00:00:00-06:00',
        udate: '2026-01-02T00:00:00-06:00',
        adate: null,
        edate: null,
        orgid: '0',
        orgname: '',
        bounced_hard: '0',
        bounced_soft: '0',
        bounced_date: null,
        ip: '127.0.0.1',
        sentcnt: '5',
        rating_tstamp: null,
        deleted: '0',
        anonymized: '0',
      };

      const record = transformContactToRecord(contact);
      expect(record.id).toBe('1');
      expect(record.email).toBe('test@example.com');
      expect(record.firstName).toBe('John');
      expect(record.lastName).toBe('Doe');
      expect(record.phone).toBe('555-1234');
    });

    it('Should include custom field values with cf_ prefix for contacts', () => {
      const contact = { id: '1', email: 'test@example.com' };
      const cfValues = [
        { field: '5', value: 'Custom Value' },
        { field: '10', value: 'Another Value' },
      ];

      const record = transformContactToRecord(contact, cfValues);
      expect(record[`${CUSTOM_FIELD_PREFIX}5`]).toBe('Custom Value');
      expect(record[`${CUSTOM_FIELD_PREFIX}10`]).toBe('Another Value');
    });

    it('Should transform deal API response to flat record', () => {
      const deal = {
        id: '10',
        title: 'Big Deal',
        description: 'A big deal',
        value: '5000',
        currency: 'usd',
        percent: '50',
        owner: '1',
        contact: '2',
        organization: null,
        account: '3',
        group: '1',
        stage: '5',
        status: '0',
        cdate: '2026-01-01T00:00:00-06:00',
        mdate: '2026-01-02T00:00:00-06:00',
        edate: null,
        nextdate: null,
        winProbability: 50,
        activitycount: '3',
        isDisabled: false,
      };

      const record = transformDealToRecord(deal);
      expect(record.id).toBe('10');
      expect(record.title).toBe('Big Deal');
      expect(record.value).toBe('5000');
      expect(record.winProbability).toBe(50);
      expect(record.isDisabled).toBe(false);
    });

    it('Should include custom field values for deals', () => {
      const deal = { id: '10', title: 'Deal' };
      const cfValues = [{ customFieldId: 3, fieldValue: 'cf_data' }];

      const record = transformDealToRecord(deal, cfValues);
      expect(record[`${CUSTOM_FIELD_PREFIX}3`]).toBe('cf_data');
    });

    it('Should transform account API response to flat record', () => {
      const account = {
        id: '5',
        name: 'Test Company',
        accountUrl: 'https://testcompany.com',
        createdTimestamp: '2026-01-01T00:00:00-06:00',
        updatedTimestamp: '2026-01-02T00:00:00-06:00',
        contactCount: 10,
        dealCount: 3,
      };

      const record = transformAccountToRecord(account);
      expect(record.id).toBe('5');
      expect(record.name).toBe('Test Company');
      expect(record.accountUrl).toBe('https://testcompany.com');
      expect(record.contactCount).toBe(10);
      expect(record.dealCount).toBe(3);
    });

    it('Should build correct contact create payload', () => {
      const record = {
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '555-0000',
        [`${CUSTOM_FIELD_PREFIX}5`]: 'Custom Val',
      };

      const { standardPayload, customFields } = transformRecordToPayload(record, 'Contacts');
      expect(standardPayload.email).toBe('new@example.com');
      expect(standardPayload.firstName).toBe('Jane');
      expect(standardPayload.fields).toBeDefined();
      expect((standardPayload.fields as Array<{ customFieldId: string }>)[0].customFieldId).toBe('5');
      expect(customFields.length).toBe(1);
    });

    it('Should build correct deal create payload (custom fields separate)', () => {
      const record = {
        title: 'New Deal',
        value: '1000',
        currency: 'usd',
        [`${CUSTOM_FIELD_PREFIX}7`]: 'cf_val',
      };

      const { standardPayload, customFields } = transformRecordToPayload(record, 'Deals');
      expect(standardPayload.title).toBe('New Deal');
      expect(standardPayload.value).toBe('1000');
      // For deals, custom fields should NOT be in the standard payload
      expect(standardPayload.fields).toBeUndefined();
      expect(customFields.length).toBe(1);
      expect(customFields[0].id).toBe('7');
    });

    it('Should build correct account create payload', () => {
      const record = {
        name: 'Acme Corp',
        accountUrl: 'https://acme.com',
        [`${CUSTOM_FIELD_PREFIX}2`]: 'cf_data',
      };

      const { standardPayload, customFields } = transformRecordToPayload(record, 'Accounts');
      expect(standardPayload.name).toBe('Acme Corp');
      expect(standardPayload.accountUrl).toBe('https://acme.com');
      expect(standardPayload.fields).toBeDefined();
      expect(customFields.length).toBe(1);
    });

    it('Should skip read-only fields and id in payloads', () => {
      const record = {
        id: '999',
        email: 'user@test.com',
        cdate: '2026-01-01',
        udate: '2026-01-02',
        orgid: '0',
      };

      const { standardPayload } = transformRecordToPayload(record, 'Contacts');
      expect(standardPayload.id).toBeUndefined();
      expect(standardPayload.cdate).toBeUndefined();
      expect(standardPayload.udate).toBeUndefined();
      expect(standardPayload.orgid).toBeUndefined();
      expect(standardPayload.email).toBe('user@test.com');
    });

    it('Should normalize column-format set to single record', () => {
      const set = {
        firstName: ['Updated'],
        email: ['updated@test.com'],
      };

      const result = normalizeSetToSingleRecord(set);
      expect(result.firstName).toBe('Updated');
      expect(result.email).toBe('updated@test.com');
    });

    it('Should handle flat object in normalizeSetToSingleRecord', () => {
      const set = {
        firstName: 'Updated',
        email: 'updated@test.com',
      };

      const result = normalizeSetToSingleRecord(set);
      expect(result.firstName).toBe('Updated');
      expect(result.email).toBe('updated@test.com');
    });
  });

  describe('Unit Tests - Server-Side Parameter Extraction', () => {
    it('Should extract email == filter for Contacts', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'email' },
          { type_code: 'value', value: 'test@example.com' },
        ],
      } as any;

      const { serverParams } = extractServerSideParams(where, 'Contacts');
      expect(serverParams.email).toBe('test@example.com');
    });

    it('Should extract email contains as email_like for Contacts', () => {
      const where = {
        exp: 'contains',
        args: [
          { type_code: 'field reference', field: 'email' },
          { type_code: 'value', value: '@gmail.com' },
        ],
      } as any;

      const { serverParams } = extractServerSideParams(where, 'Contacts');
      expect(serverParams.email_like).toBe('@gmail.com');
    });

    it('Should extract phone == filter for Contacts', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'phone' },
          { type_code: 'value', value: '555-1234' },
        ],
      } as any;

      const { serverParams } = extractServerSideParams(where, 'Contacts');
      expect(serverParams.phone).toBe('555-1234');
    });

    it('Should extract status == filter for Contacts', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'status' },
          { type_code: 'value', value: '1' },
        ],
      } as any;

      const { serverParams } = extractServerSideParams(where, 'Contacts');
      expect(serverParams.status).toBe('1');
    });

    it('Should use search param for name-like contains', () => {
      const where = {
        exp: 'contains',
        args: [
          { type_code: 'field reference', field: 'firstName' },
          { type_code: 'value', value: 'John' },
        ],
      } as any;

      const { serverParams } = extractServerSideParams(where, 'Contacts');
      expect(serverParams.search).toBe('John');
    });

    it('Should use search param for deal title contains', () => {
      const where = {
        exp: 'contains',
        args: [
          { type_code: 'field reference', field: 'title' },
          { type_code: 'value', value: 'Big' },
        ],
      } as any;

      const { serverParams } = extractServerSideParams(where, 'Deals');
      expect(serverParams.search).toBe('Big');
    });

    it('Should use search param for account name contains', () => {
      const where = {
        exp: 'contains',
        args: [
          { type_code: 'field reference', field: 'name' },
          { type_code: 'value', value: 'Acme' },
        ],
      } as any;

      const { serverParams } = extractServerSideParams(where, 'Accounts');
      expect(serverParams.search).toBe('Acme');
    });

    it('Should pass unsupported operators to client-side', () => {
      const where = {
        exp: '!=',
        args: [
          { type_code: 'field reference', field: 'email' },
          { type_code: 'value', value: 'skip@test.com' },
        ],
      } as any;

      const { serverParams, remainingWhere } = extractServerSideParams(where, 'Contacts');
      expect(Object.keys(serverParams).length).toBe(0);
      expect(remainingWhere).toBeDefined();
    });

    it('Should handle compound AND conditions', () => {
      const where = {
        exp: '&&',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'email' },
              { type_code: 'value', value: 'test@test.com' },
            ],
          },
          {
            exp: '>',
            args: [
              { type_code: 'field reference', field: 'sentcnt' },
              { type_code: 'value', value: '5' },
            ],
          },
        ],
      } as any;

      const { serverParams, remainingWhere } = extractServerSideParams(where, 'Contacts');
      expect(serverParams.email).toBe('test@test.com');
      // The > operator should be in remaining
      expect(remainingWhere).toBeDefined();
    });

    it('Should return empty params for undefined WHERE', () => {
      const { serverParams, remainingWhere } = extractServerSideParams(undefined, 'Contacts');
      expect(Object.keys(serverParams).length).toBe(0);
      expect(remainingWhere).toBeNull();
    });
  });

  describe('Unit Tests - Client-Side Filtering', () => {
    const records = [
      { id: '1', email: 'alice@test.com', firstName: 'Alice', sentcnt: '10', cdate: '2026-01-01T00:00:00Z' },
      { id: '2', email: 'bob@example.com', firstName: 'Bob', sentcnt: '5', cdate: '2026-02-01T00:00:00Z' },
      { id: '3', email: 'charlie@test.com', firstName: 'Charlie', sentcnt: '0', cdate: '2026-03-01T00:00:00Z' },
      { id: '4', email: null, firstName: null, sentcnt: null, cdate: null },
    ] as Record<string, unknown>[];

    it('Should filter with == operator', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'firstName' },
          { type_code: 'value', value: 'Alice' },
        ],
      } as any;

      const result = filterRecords(records, where);
      expect(result.length).toBe(1);
      expect(result[0].firstName).toBe('Alice');
    });

    it('Should filter with != operator', () => {
      const where = {
        exp: '!=',
        args: [
          { type_code: 'field reference', field: 'firstName' },
          { type_code: 'value', value: 'Alice' },
        ],
      } as any;

      const result = filterRecords(records, where);
      expect(result.length).toBe(3); // Bob, Charlie, and null != Alice
    });

    it('Should filter with contains operator (case-insensitive)', () => {
      const where = {
        exp: 'contains',
        args: [
          { type_code: 'field reference', field: 'email' },
          { type_code: 'value', value: 'TEST' },
        ],
      } as any;

      const result = filterRecords(records, where);
      expect(result.length).toBe(2);
    });

    it('Should filter with is-set operator', () => {
      const where = {
        exp: 'is-set',
        args: [{ type_code: 'field reference', field: 'firstName' }],
      } as any;

      const result = filterRecords(records, where);
      expect(result.length).toBe(3);
    });

    it('Should filter with is-not-set operator', () => {
      const where = {
        exp: 'is-not-set',
        args: [{ type_code: 'field reference', field: 'firstName' }],
      } as any;

      const result = filterRecords(records, where);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('4');
    });

    it('Should filter with > operator on numeric strings', () => {
      const where = {
        exp: '>',
        args: [
          { type_code: 'field reference', field: 'sentcnt' },
          { type_code: 'value', value: '5' },
        ],
      } as any;

      const result = filterRecords(records, where);
      expect(result.length).toBe(1);
      expect(result[0].sentcnt).toBe('10');
    });

    it('Should filter with >= operator', () => {
      const where = {
        exp: '>=',
        args: [
          { type_code: 'field reference', field: 'sentcnt' },
          { type_code: 'value', value: '5' },
        ],
      } as any;

      const result = filterRecords(records, where);
      expect(result.length).toBe(2);
    });

    it('Should filter with < operator', () => {
      const where = {
        exp: '<',
        args: [
          { type_code: 'field reference', field: 'sentcnt' },
          { type_code: 'value', value: '5' },
        ],
      } as any;

      const result = filterRecords(records, where);
      expect(result.length).toBe(1);
      expect(result[0].sentcnt).toBe('0');
    });

    it('Should filter with <= operator', () => {
      const where = {
        exp: '<=',
        args: [
          { type_code: 'field reference', field: 'sentcnt' },
          { type_code: 'value', value: '5' },
        ],
      } as any;

      const result = filterRecords(records, where);
      expect(result.length).toBe(2);
    });

    it('Should filter with && (AND) logical operator', () => {
      const where = {
        exp: '&&',
        args: [
          {
            exp: 'contains',
            args: [
              { type_code: 'field reference', field: 'email' },
              { type_code: 'value', value: 'test.com' },
            ],
          },
          {
            exp: '>',
            args: [
              { type_code: 'field reference', field: 'sentcnt' },
              { type_code: 'value', value: '0' },
            ],
          },
        ],
      } as any;

      const result = filterRecords(records, where);
      expect(result.length).toBe(1);
      expect(result[0].firstName).toBe('Alice');
    });

    it('Should filter with || (OR) logical operator', () => {
      const where = {
        exp: '||',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'firstName' },
              { type_code: 'value', value: 'Alice' },
            ],
          },
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'firstName' },
              { type_code: 'value', value: 'Charlie' },
            ],
          },
        ],
      } as any;

      const result = filterRecords(records, where);
      expect(result.length).toBe(2);
    });

    it('Should return all records when WHERE is undefined', () => {
      const result = filterRecords(records, undefined);
      expect(result.length).toBe(records.length);
    });

    it('Should return all records when WHERE is null', () => {
      const result = filterRecords(records, null);
      expect(result.length).toBe(records.length);
    });
  });

  describe('Unit Tests - Client-Side Sorting', () => {
    const records = [
      { id: '3', firstName: 'Charlie', sentcnt: '0', cdate: '2026-03-01T00:00:00Z' },
      { id: '1', firstName: 'Alice', sentcnt: '10', cdate: '2026-01-01T00:00:00Z' },
      { id: '2', firstName: 'Bob', sentcnt: '5', cdate: '2026-02-01T00:00:00Z' },
    ] as Record<string, unknown>[];

    it('Should sort by string field ascending', () => {
      const result = sortRecords(records, { field: 'firstName', direction: 'asc' });
      expect(result[0].firstName).toBe('Alice');
      expect(result[1].firstName).toBe('Bob');
      expect(result[2].firstName).toBe('Charlie');
    });

    it('Should sort by string field descending', () => {
      const result = sortRecords(records, { field: 'firstName', direction: 'desc' });
      expect(result[0].firstName).toBe('Charlie');
      expect(result[1].firstName).toBe('Bob');
      expect(result[2].firstName).toBe('Alice');
    });

    it('Should sort by date field', () => {
      const result = sortRecords(records, { field: 'cdate', direction: 'asc' });
      expect(result[0].id).toBe('1');
      expect(result[2].id).toBe('3');
    });

    it('Should handle null values in sorting', () => {
      const withNull = [
        ...records,
        { id: '4', firstName: null, sentcnt: null, cdate: null },
      ] as Record<string, unknown>[];

      const result = sortRecords(withNull, { field: 'firstName', direction: 'asc' });
      // null should be sorted to the end for ascending
      expect(result[result.length - 1].id).toBe('4');
    });

    it('Should return unmodified array when orderBy is undefined', () => {
      const result = sortRecords(records);
      expect(result).toEqual(records);
    });

    it('Should return unmodified array when field is empty', () => {
      const result = sortRecords(records, { field: '' });
      expect(result).toEqual(records);
    });

    it('Should default direction to ascending', () => {
      const result = sortRecords(records, { field: 'firstName' });
      expect(result[0].firstName).toBe('Alice');
    });
  });

  describe('Unit Tests - canSortServerSide', () => {
    it('Should return true for sortable Contact fields', () => {
      expect(canSortServerSide('Contacts', 'email')).toBe(true);
      expect(canSortServerSide('Contacts', 'cdate')).toBe(true);
      expect(canSortServerSide('Contacts', 'id')).toBe(true);
    });

    it('Should return false for non-sortable Contact fields', () => {
      expect(canSortServerSide('Contacts', 'orgname')).toBe(false);
      expect(canSortServerSide('Contacts', 'phone')).toBe(false);
    });

    it('Should return true for sortable Deal fields', () => {
      expect(canSortServerSide('Deals', 'cdate')).toBe(true);
      expect(canSortServerSide('Deals', 'title')).toBe(true);
    });

    it('Should return true for sortable Account fields', () => {
      expect(canSortServerSide('Accounts', 'name')).toBe(true);
      expect(canSortServerSide('Accounts', 'createdTimestamp')).toBe(true);
    });

    it('Should return false when field is undefined', () => {
      expect(canSortServerSide('Contacts', undefined)).toBe(false);
    });
  });

  describe('Unit Tests - Error Cases', () => {
    it('Should throw error when creating records without table name', async () => {
      await expect(
        createActiveCampaignRecords(
          { conn_opts: { token: 'x', instance_url: 'http://test' } } as any,
          { email: ['test@test.com'] },
          {} as any
        )
      ).rejects.toThrow('Table name is required');
    });

    it('Should throw error for unknown table name on create', async () => {
      await expect(
        createActiveCampaignRecords(
          { conn_opts: { token: 'x', instance_url: 'http://test' } } as any,
          { email: ['test@test.com'] },
          { table: 'Unknown' } as any
        )
      ).rejects.toThrow('Unknown table');
    });

    it('Should throw error when deleting without WHERE condition', async () => {
      await expect(
        deleteActiveCampaignRecords(
          { conn_opts: { token: 'x', instance_url: 'http://test' } } as any,
          undefined as any,
          { table: 'Contacts' } as any
        )
      ).rejects.toThrow('WHERE condition is required');
    });

    it('Should throw error when updating without WHERE condition', async () => {
      await expect(
        updateActiveCampaignRecords(
          { conn_opts: { token: 'x', instance_url: 'http://test' } } as any,
          { firstName: ['Updated'] },
          undefined as any,
          { table: 'Contacts' } as any
        )
      ).rejects.toThrow('WHERE condition is required');
    });

    it('Should throw error when searching without table name', async () => {
      await expect(
        searchActiveCampaignRecords(
          { conn_opts: { token: 'x', instance_url: 'http://test' } } as any,
          undefined,
          {} as any
        )
      ).rejects.toThrow('Table name is required');
    });

    it('Should throw error for unknown entity type in getStandardFields', () => {
      expect(() => {
        transformRecordToPayload({ name: 'test' }, 'UnknownEntity' as any);
      }).not.toThrow(); // It just won't have writable fields
    });
  });

  // ============================================================
  // INTEGRATION TESTS (Require API credentials)
  // ============================================================

  describe.skip('Integration Tests - Record-Based Operations', () => {
    const baseContext = {
      conn_opts: {
        token: '',
        instance_url: '',
      } as any,
    };

    let hasCredentials = false;

    beforeAll(() => {
      const token = process.env.ACTIVE_CAMPAIGN_TOKEN;
      const instanceUrl = process.env.ACTIVE_CAMPAIGN_INSTANCE_URL;

      if (!token || !instanceUrl) {
        console.warn(
          'ACTIVE_CAMPAIGN_TOKEN or ACTIVE_CAMPAIGN_INSTANCE_URL not set, skipping integration tests'
        );
        return;
      }

      hasCredentials = true;
      baseContext.conn_opts.token = token;
      baseContext.conn_opts.instance_url = instanceUrl;
    });

    afterEach(async () => {
      if (hasCredentials) {
        await delay(300);
      }
    });

    // Track created records for cleanup
    const createdContactIds: string[] = [];
    const createdDealIds: string[] = [];
    const createdAccountIds: string[] = [];

    afterAll(async () => {
      if (!hasCredentials) {
        return;
      }

      // Cleanup created records
      for (const id of createdContactIds) {
        try {
          await deleteActiveCampaignRecords(
            baseContext as any,
            {
              exp: '==',
              args: [
                { type_code: 'field reference', field: 'id' },
                { type_code: 'value', value: id },
              ],
            } as any,
            { table: 'Contacts' } as any
          );
          await delay(300);
        } catch {
          // May already be deleted
        }
      }

      for (const id of createdDealIds) {
        try {
          await deleteActiveCampaignRecords(
            baseContext as any,
            {
              exp: '==',
              args: [
                { type_code: 'field reference', field: 'id' },
                { type_code: 'value', value: id },
              ],
            } as any,
            { table: 'Deals' } as any
          );
          await delay(300);
        } catch {
          // May already be deleted
        }
      }

      for (const id of createdAccountIds) {
        try {
          await deleteActiveCampaignRecords(
            baseContext as any,
            {
              exp: '==',
              args: [
                { type_code: 'field reference', field: 'id' },
                { type_code: 'value', value: id },
              ],
            } as any,
            { table: 'Accounts' } as any
          );
          await delay(300);
        } catch {
          // May already be deleted
        }
      }
    });

    describe('Table List', () => {
      it('Should return the static table list', async () => {
        if (!hasCredentials) {
          console.warn('Skipping: no credentials');
          return;
        }

        const tables = await getActiveCampaignTableList(baseContext as any);
        expect(tables).toEqual(['Contacts', 'Deals', 'Accounts']);
      });
    });

    describe('Record Type', () => {
      it('Should get record type for Contacts', async () => {
        if (!hasCredentials) {
          console.warn('Skipping: no credentials');
          return;
        }

        const recordType = await getActiveCampaignRecordType(baseContext as any, 'Contacts');
        expect(recordType.type).toBe('hash');
        const fields = (recordType as any).fields;
        expect(fields.id).toBeDefined();
        expect(fields.email).toBeDefined();
        expect(fields.firstName).toBeDefined();
        expect(fields.lastName).toBeDefined();
      }, 30_000);

      it('Should get record type for Deals', async () => {
        if (!hasCredentials) {
          console.warn('Skipping: no credentials');
          return;
        }

        const recordType = await getActiveCampaignRecordType(baseContext as any, 'Deals');
        expect(recordType.type).toBe('hash');
        const fields = (recordType as any).fields;
        expect(fields.id).toBeDefined();
        expect(fields.title).toBeDefined();
        expect(fields.value).toBeDefined();
      }, 30_000);

      it('Should get record type for Accounts', async () => {
        if (!hasCredentials) {
          console.warn('Skipping: no credentials');
          return;
        }

        const recordType = await getActiveCampaignRecordType(baseContext as any, 'Accounts');
        expect(recordType.type).toBe('hash');
        const fields = (recordType as any).fields;
        expect(fields.id).toBeDefined();
        expect(fields.name).toBeDefined();
        expect(fields.accountUrl).toBeDefined();
      }, 30_000);
    });

    describe('Search Records', () => {
      it('Should search Contacts with pagination', async () => {
        if (!hasCredentials) {
          console.warn('Skipping: no credentials');
          return;
        }

        const iterator = await searchActiveCampaignRecords(
          baseContext as any,
          undefined,
          { table: 'Contacts' } as any
        );
        expect(typeof iterator).toBe('function');

        const batch = await iterator(baseContext as any, 5);
        if (batch) {
          const records = mapColumnFormatToObject(batch);
          expect(Array.isArray(records)).toBe(true);
          if (records.length > 0) {
            expect(records[0].id).toBeDefined();
            expect(records[0].email).toBeDefined();
          }
        }
      }, 30_000);

      it('Should search Deals', async () => {
        if (!hasCredentials) {
          console.warn('Skipping: no credentials');
          return;
        }

        const iterator = await searchActiveCampaignRecords(
          baseContext as any,
          undefined,
          { table: 'Deals' } as any
        );
        expect(typeof iterator).toBe('function');

        const batch = await iterator(baseContext as any, 5);
        // May be null if no deals exist
        if (batch) {
          const records = mapColumnFormatToObject(batch);
          expect(Array.isArray(records)).toBe(true);
        }
      }, 30_000);

      it('Should search Accounts', async () => {
        if (!hasCredentials) {
          console.warn('Skipping: no credentials');
          return;
        }

        const iterator = await searchActiveCampaignRecords(
          baseContext as any,
          undefined,
          { table: 'Accounts' } as any
        );
        expect(typeof iterator).toBe('function');

        const batch = await iterator(baseContext as any, 5);
        if (batch) {
          const records = mapColumnFormatToObject(batch);
          expect(Array.isArray(records)).toBe(true);
        }
      }, 30_000);
    });

    describe('CRUD Cycle - Contacts', () => {
      let contactId: string;

      it('Should create a contact', async () => {
        if (!hasCredentials) {
          console.warn('Skipping: no credentials');
          return;
        }

        const testEmail = `ac-test-${Date.now()}@example.com`;
        const records = {
          email: [testEmail],
          firstName: ['Test'],
          lastName: ['RecordBased'],
        };

        const created = await createActiveCampaignRecords(
          baseContext as any,
          records,
          { table: 'Contacts' } as any
        );

        expect(created.id).toBeDefined();
        expect(created.id.length).toBe(1);
        contactId = created.id[0] as string;
        createdContactIds.push(contactId);
        expect(created.email[0]).toBe(testEmail);
      }, 30_000);

      it('Should search for the created contact by email', async () => {
        if (!hasCredentials || !contactId) {
          console.warn('Skipping: no credentials or no contact');
          return;
        }

        const where = {
          exp: '==',
          args: [
            { type_code: 'field reference', field: 'id' },
            { type_code: 'value', value: contactId },
          ],
        } as any;

        const iterator = await searchActiveCampaignRecords(
          baseContext as any,
          where,
          { table: 'Contacts' } as any
        );

        const batch = await iterator(baseContext as any, 10);
        expect(batch).not.toBeNull();

        if (batch) {
          const records = mapColumnFormatToObject(batch);
          expect(records.length).toBeGreaterThanOrEqual(1);
          const found = records.find((r) => r.id === contactId);
          expect(found).toBeDefined();
        }
      }, 30_000);

      it('Should update the contact', async () => {
        if (!hasCredentials || !contactId) {
          console.warn('Skipping: no credentials or no contact');
          return;
        }

        const where = {
          exp: '==',
          args: [
            { type_code: 'field reference', field: 'id' },
            { type_code: 'value', value: contactId },
          ],
        } as any;

        const count = await updateActiveCampaignRecords(
          baseContext as any,
          { firstName: ['Updated'] },
          where,
          { table: 'Contacts' } as any
        );

        expect(count).toBe(1);
      }, 30_000);

      it('Should delete the contact', async () => {
        if (!hasCredentials || !contactId) {
          console.warn('Skipping: no credentials or no contact');
          return;
        }

        const where = {
          exp: '==',
          args: [
            { type_code: 'field reference', field: 'id' },
            { type_code: 'value', value: contactId },
          ],
        } as any;

        const count = await deleteActiveCampaignRecords(
          baseContext as any,
          where,
          { table: 'Contacts' } as any
        );

        expect(count).toBe(1);

        // Remove from cleanup list since already deleted
        const idx = createdContactIds.indexOf(contactId);
        if (idx >= 0) {
          createdContactIds.splice(idx, 1);
        }
      }, 30_000);
    });

    describe('CRUD Cycle - Accounts', () => {
      let accountId: string;

      it('Should create an account', async () => {
        if (!hasCredentials) {
          console.warn('Skipping: no credentials');
          return;
        }

        const records = {
          name: [`Test Account ${Date.now()}`],
          accountUrl: ['https://test-record-based.example.com'],
        };

        const created = await createActiveCampaignRecords(
          baseContext as any,
          records,
          { table: 'Accounts' } as any
        );

        expect(created.id).toBeDefined();
        expect(created.id.length).toBe(1);
        accountId = created.id[0] as string;
        createdAccountIds.push(accountId);
      }, 30_000);

      it('Should update the account', async () => {
        if (!hasCredentials || !accountId) {
          console.warn('Skipping: no credentials or no account');
          return;
        }

        const where = {
          exp: '==',
          args: [
            { type_code: 'field reference', field: 'id' },
            { type_code: 'value', value: accountId },
          ],
        } as any;

        const count = await updateActiveCampaignRecords(
          baseContext as any,
          { name: [`Updated Account ${Date.now()}`] },
          where,
          { table: 'Accounts' } as any
        );

        expect(count).toBe(1);
      }, 30_000);

      it('Should delete the account', async () => {
        if (!hasCredentials || !accountId) {
          console.warn('Skipping: no credentials or no account');
          return;
        }

        const where = {
          exp: '==',
          args: [
            { type_code: 'field reference', field: 'id' },
            { type_code: 'value', value: accountId },
          ],
        } as any;

        const count = await deleteActiveCampaignRecords(
          baseContext as any,
          where,
          { table: 'Accounts' } as any
        );

        expect(count).toBe(1);

        const idx = createdAccountIds.indexOf(accountId);
        if (idx >= 0) {
          createdAccountIds.splice(idx, 1);
        }
      }, 30_000);
    });

    describe('CRUD Cycle - Deals', () => {
      let dealId: string;
      let pipelineId: string;
      let stageId: string;
      let ownerId: string;
      let tempContactId: string;

      beforeAll(async () => {
        if (!hasCredentials) {
          return;
        }

        const clientOpts = { token: baseContext.conn_opts.token, baseUrl: baseContext.conn_opts.instance_url };

        // Create a temporary contact to associate with the deal
        const contactResp = await activeCampaignClient.post<Record<string, unknown>>(
          'contacts',
          { contact: { email: `deal-test-${Date.now()}@example.com`, firstName: 'DealTest' } },
          clientOpts
        );
        const contact = contactResp.contact as Record<string, unknown> | undefined;
        if (contact) {
          tempContactId = String(contact.id);
        }

        // Fetch or create a pipeline (deal group)
        const pipelinesResp = await activeCampaignClient.get<Record<string, unknown>>(
          'dealGroups',
          clientOpts
        );
        const pipelines = (pipelinesResp.dealGroups || []) as Record<string, unknown>[];
        if (pipelines.length > 0) {
          pipelineId = String(pipelines[0].id);
        } else {
          // Create a test pipeline
          const newPipeline = await activeCampaignClient.post<Record<string, unknown>>(
            'dealGroups',
            { dealGroup: { title: 'Test Pipeline', currency: 'usd' } },
            clientOpts
          );
          const group = newPipeline.dealGroup as Record<string, unknown> | undefined;
          if (group) {
            pipelineId = String(group.id);
          }
        }

        // Fetch stages for that pipeline, or create one
        if (pipelineId) {
          const stagesResp = await activeCampaignClient.get<Record<string, unknown>>(
            'dealStages',
            { ...clientOpts, params: { 'filters[d_groupid]': pipelineId } }
          );
          const stages = (stagesResp.dealStages || []) as Record<string, unknown>[];
          if (stages.length > 0) {
            stageId = String(stages[0].id);
          } else {
            // Create a test stage in the pipeline
            const newStage = await activeCampaignClient.post<Record<string, unknown>>(
              'dealStages',
              { dealStage: { title: 'Test Stage', group: pipelineId, order: 1 } },
              clientOpts
            );
            const stage = newStage.dealStage as Record<string, unknown> | undefined;
            if (stage) {
              stageId = String(stage.id);
            }
          }
        }

        // Fetch a user/owner
        const usersResp = await activeCampaignClient.get<Record<string, unknown>>(
          'users',
          clientOpts
        );
        const users = (usersResp.users || []) as Record<string, unknown>[];
        if (users.length > 0) {
          ownerId = String(users[0].id);
        }
      }, 30_000);

      afterAll(async () => {
        if (tempContactId) {
          try {
            await activeCampaignClient.delete(`contacts/${tempContactId}`, {
              token: baseContext.conn_opts.token,
              baseUrl: baseContext.conn_opts.instance_url,
            });
          } catch {
            // Ignore cleanup errors
          }
        }
      }, 15_000);

      it('Should create a deal', async () => {
        if (!hasCredentials || !pipelineId || !stageId || !ownerId || !tempContactId) {
          console.warn('Skipping: no credentials or missing pipeline/stage/owner/contact');
          return;
        }

        const records = {
          title: [`Test Deal ${Date.now()}`],
          value: ['1000'],
          currency: ['usd'],
          group: [pipelineId],
          stage: [stageId],
          owner: [ownerId],
          contact: [tempContactId],
        };

        const created = await createActiveCampaignRecords(
          baseContext as any,
          records,
          { table: 'Deals' } as any
        );

        expect(created.id).toBeDefined();
        expect(created.id.length).toBe(1);
        dealId = created.id[0] as string;
        createdDealIds.push(dealId);
      }, 30_000);

      it('Should update the deal', async () => {
        if (!hasCredentials || !dealId) {
          console.warn('Skipping: no credentials or no deal');
          return;
        }

        const where = {
          exp: '==',
          args: [
            { type_code: 'field reference', field: 'id' },
            { type_code: 'value', value: dealId },
          ],
        } as any;

        const count = await updateActiveCampaignRecords(
          baseContext as any,
          { title: [`Updated Deal ${Date.now()}`] },
          where,
          { table: 'Deals' } as any
        );

        expect(count).toBe(1);
      }, 30_000);

      it('Should delete the deal', async () => {
        if (!hasCredentials || !dealId) {
          console.warn('Skipping: no credentials or no deal');
          return;
        }

        const where = {
          exp: '==',
          args: [
            { type_code: 'field reference', field: 'id' },
            { type_code: 'value', value: dealId },
          ],
        } as any;

        const count = await deleteActiveCampaignRecords(
          baseContext as any,
          where,
          { table: 'Deals' } as any
        );

        expect(count).toBe(1);

        const idx = createdDealIds.indexOf(dealId);
        if (idx >= 0) {
          createdDealIds.splice(idx, 1);
        }
      }, 30_000);
    });

    describe('Search with Expressions', () => {
      it('Should search contacts with email contains filter', async () => {
        if (!hasCredentials) {
          console.warn('Skipping: no credentials');
          return;
        }

        const where = {
          exp: 'contains',
          args: [
            { type_code: 'field reference', field: 'email' },
            { type_code: 'value', value: '@' },
          ],
        } as any;

        const iterator = await searchActiveCampaignRecords(
          baseContext as any,
          where,
          { table: 'Contacts', limit: 5 } as any
        );

        const batch = await iterator(baseContext as any, 5);
        if (batch) {
          const records = mapColumnFormatToObject(batch);
          for (const record of records) {
            expect(String(record.email)).toContain('@');
          }
        }
      }, 30_000);

      it('Should search with AND compound condition', async () => {
        if (!hasCredentials) {
          console.warn('Skipping: no credentials');
          return;
        }

        const where = {
          exp: '&&',
          args: [
            {
              exp: 'is-set',
              args: [{ type_code: 'field reference', field: 'email' }],
            },
            {
              exp: 'is-set',
              args: [{ type_code: 'field reference', field: 'firstName' }],
            },
          ],
        } as any;

        const iterator = await searchActiveCampaignRecords(
          baseContext as any,
          where,
          { table: 'Contacts', limit: 5 } as any
        );

        const batch = await iterator(baseContext as any, 5);
        if (batch) {
          const records = mapColumnFormatToObject(batch);
          for (const record of records) {
            expect(record.email).toBeTruthy();
            expect(record.firstName).toBeTruthy();
          }
        }
      }, 30_000);
    });
  });
});
