/**
 * Mailchimp Record-Based Helpers Tests
 *
 * Unit tests for expressions, search options, and client-side filtering.
 * Integration tests for full CRUD cycle with real Mailchimp API.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { configDotenv } from 'dotenv';
import {
  clearMappingsCache,
  getMailchimpTableList,
  getMailchimpRecordType,
  getMailchimpExpressions,
  MailchimpSearchOptions,
  filterRecords,
  sortRecords,
  extractServerFilters,
  serverFiltersToParams,
  searchMailchimpRecords,
  createMailchimpRecords,
  updateMailchimpRecords,
  deleteMailchimpRecords,
  upsertMailchimpRecords,
  transformMemberToRecord,
  transformRecordToMemberPayload,
  getSubscriberHash,
  normalizeSetToSingleRecord,
  MailchimpError,
} from '../apps/mailchimp/helpers/record-based';
import { mapColumnFormatToObject, delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;

configDotenv({ path: '.env' });

describe('Mailchimp Record-Based', () => {
  // --- Unit Tests ---

  describe('Should test Mailchimp expressions and search options (unit tests)', () => {
    it('Should return valid expressions configuration', () => {
      const expressions = getMailchimpExpressions('en');

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

      // Verify expression structure
      const eqExpr = expressions['=='];
      expect(eqExpr.type).toBe('operator');
      expect(eqExpr.roles).toContain('search');
      expect(eqExpr.args).toBeDefined();
      expect(eqExpr.args.length).toBe(2);
      expect(eqExpr.return_type).toBe('bool');

      // Verify logical operator structure
      const andExpr = expressions['&&'];
      expect(andExpr.type).toBe('operator');
      expect(andExpr.subtype).toBe('logic-operator');
      expect(andExpr.varargs).toBe(true);
    });

    it('Should have valid search options configuration', () => {
      expect(MailchimpSearchOptions).toBeDefined();
      expect(MailchimpSearchOptions.orderBy).toBeDefined();

      const orderByType = MailchimpSearchOptions.orderBy.type as { type: string; fields: Record<string, any> };
      expect(orderByType.type).toBe('hash');

      const orderByFields = orderByType.fields;
      expect(orderByFields).toBeDefined();
      expect(orderByFields.field).toBeDefined();
      expect(orderByFields.direction).toBeDefined();

      const allowedFields = orderByFields.field.allowed_values.map((v: any) => v.value);
      expect(allowedFields).toContain('email_address');
      expect(allowedFields).toContain('last_changed');
      expect(allowedFields).toContain('member_rating');

      const allowedDirections = orderByFields.direction.allowed_values.map((v: any) => v.value);
      expect(allowedDirections).toContain('asc');
      expect(allowedDirections).toContain('desc');
    });
  });

  describe('Should test member transformations (unit tests)', () => {
    it('Should transform member to record with merge fields', () => {
      const mockMember = {
        id: 'abc123',
        email_address: 'test@example.com',
        unique_email_id: 'unique1',
        web_id: 12345,
        email_type: 'html',
        status: 'subscribed',
        merge_fields: { FNAME: 'John', LNAME: 'Doe', PHONE: '555-1234' },
        stats: { avg_open_rate: 0.45, avg_click_rate: 0.12 },
        ip_signup: '127.0.0.1',
        timestamp_signup: '2026-01-01T00:00:00Z',
        ip_opt: '127.0.0.1',
        timestamp_opt: '2026-01-01T00:00:00Z',
        member_rating: 4,
        last_changed: '2026-02-15T10:00:00Z',
        language: 'en',
        vip: true,
        email_client: 'Gmail',
        location: {
          latitude: 37.77,
          longitude: -122.42,
          gmtoff: -8,
          dstoff: -7,
          country_code: 'US',
          timezone: 'America/Los_Angeles',
        },
        tags_count: 2,
        tags: [
          { id: 1, name: 'VIP' },
          { id: 2, name: 'Active' },
        ],
        list_id: 'list1',
      };

      const record = transformMemberToRecord(mockMember);

      // Standard fields
      expect(record.id).toBe('abc123');
      expect(record.email_address).toBe('test@example.com');
      expect(record.status).toBe('subscribed');
      expect(record.vip).toBe(true);
      expect(record.member_rating).toBe(4);
      expect(record.language).toBe('en');

      // Flattened stats
      expect(record.avg_open_rate).toBe(0.45);
      expect(record.avg_click_rate).toBe(0.12);

      // Flattened location
      expect(record.location_country_code).toBe('US');
      expect(record.location_timezone).toBe('America/Los_Angeles');

      // Tags as comma-separated string
      expect(record.tags).toBe('VIP, Active');

      // Merge fields with cf_ prefix
      expect(record.cf_FNAME).toBe('John');
      expect(record.cf_LNAME).toBe('Doe');
      expect(record.cf_PHONE).toBe('555-1234');
    });

    it('Should transform record to member payload', () => {
      const record = {
        email_address: 'test@example.com',
        status: 'subscribed',
        language: 'en',
        vip: true,
        cf_FNAME: 'John',
        cf_LNAME: 'Doe',
        // Read-only fields should be ignored
        id: 'abc123',
        web_id: 12345,
        avg_open_rate: 0.45,
      };

      const payload = transformRecordToMemberPayload(record);

      expect(payload.email_address).toBe('test@example.com');
      expect(payload.status).toBe('subscribed');
      expect(payload.language).toBe('en');
      expect(payload.vip).toBe(true);
      expect(payload.merge_fields).toEqual({ FNAME: 'John', LNAME: 'Doe' });

      // Read-only fields should not be in payload
      expect(payload.id).toBeUndefined();
      expect(payload.web_id).toBeUndefined();
      expect(payload.avg_open_rate).toBeUndefined();
    });

    it('Should compute subscriber hash correctly', async () => {
      const hash = await getSubscriberHash('Test@Example.com');
      // md5 of "test@example.com"
      const { createHash } = await import('crypto');
      const expected = createHash('md5').update('test@example.com').digest('hex');
      expect(hash).toBe(expected);
    });

    it('Should handle member with null/missing nested fields', () => {
      const minimalMember = {
        id: 'min1',
        email_address: 'minimal@test.com',
        unique_email_id: '',
        web_id: 1,
        email_type: '',
        status: 'subscribed',
        merge_fields: {},
        stats: undefined as any,
        ip_signup: '',
        timestamp_signup: '',
        ip_opt: '',
        timestamp_opt: '',
        member_rating: 1,
        last_changed: '',
        language: '',
        vip: false,
        email_client: '',
        location: undefined as any,
        tags_count: 0,
        tags: [],
        list_id: 'list1',
      };

      const record = transformMemberToRecord(minimalMember);
      expect(record.id).toBe('min1');
      expect(record.email_address).toBe('minimal@test.com');
      expect(record.avg_open_rate).toBe(0);
      expect(record.avg_click_rate).toBe(0);
      expect(record.location_country_code).toBe('');
      expect(record.location_timezone).toBe('');
      expect(record.tags).toBe('');
    });

    it('Should produce empty payload from record with only read-only fields', () => {
      const record = {
        id: 'abc123',
        web_id: 12345,
        avg_open_rate: 0.5,
        member_rating: 4,
        last_changed: '2026-01-01',
        list_id: 'list1',
      };

      const payload = transformRecordToMemberPayload(record);
      // None of these are writable fields
      expect(Object.keys(payload).length).toBe(0);
    });

    it('Should produce empty merge_fields when no cf_ fields present', () => {
      const record = {
        email_address: 'test@example.com',
        status: 'subscribed',
      };

      const payload = transformRecordToMemberPayload(record);
      expect(payload.email_address).toBe('test@example.com');
      expect(payload.merge_fields).toBeUndefined();
    });
  });

  describe('Should test normalizeSetToSingleRecord (unit tests)', () => {
    const mockMapper = (data: Record<string, unknown>) =>
      mapColumnFormatToObject(data as Record<string, {}[]>);

    it('Should accept a single-element array', () => {
      const result = normalizeSetToSingleRecord(
        [{ cf_FNAME: 'John' }],
        mockMapper
      );
      expect(result).toEqual({ cf_FNAME: 'John' });
    });

    it('Should reject a multi-element array', () => {
      expect(() =>
        normalizeSetToSingleRecord(
          [{ cf_FNAME: 'John' }, { cf_FNAME: 'Jane' }],
          mockMapper
        )
      ).toThrow('Update supports a single record');
    });

    it('Should accept column format with single record', () => {
      const result = normalizeSetToSingleRecord(
        { cf_FNAME: ['John'], cf_LNAME: ['Doe'] },
        mockMapper
      );
      expect(result).toEqual({ cf_FNAME: 'John', cf_LNAME: 'Doe' });
    });

    it('Should reject column format with multiple records', () => {
      expect(() =>
        normalizeSetToSingleRecord(
          { cf_FNAME: ['John', 'Jane'], cf_LNAME: ['Doe', 'Smith'] },
          mockMapper
        )
      ).toThrow('Update supports a single record');
    });

    it('Should accept a plain object', () => {
      const result = normalizeSetToSingleRecord(
        { cf_FNAME: 'John' },
        mockMapper
      );
      expect(result).toEqual({ cf_FNAME: 'John' });
    });

    it('Should return empty object for null/undefined input', () => {
      expect(normalizeSetToSingleRecord(null, mockMapper)).toEqual({});
      expect(normalizeSetToSingleRecord(undefined, mockMapper)).toEqual({});
    });
  });

  describe('Should test client-side filtering (unit tests)', () => {
    const testRecords = [
      { id: '1', email_address: 'alice@test.com', status: 'subscribed', member_rating: 5, vip: true, last_changed: '2026-02-01' },
      { id: '2', email_address: 'bob@test.com', status: 'unsubscribed', member_rating: 3, vip: false, last_changed: '2026-01-15' },
      { id: '3', email_address: 'carol@test.com', status: 'subscribed', member_rating: 4, vip: false, last_changed: null },
      { id: '4', email_address: 'dave@example.com', status: 'pending', member_rating: 2, vip: false, last_changed: '2026-02-10' },
    ];

    it('Should filter with equality expression', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'status' },
          { type_code: 'value', value: 'subscribed' },
        ],
      } as any;

      const filtered = filterRecords(testRecords, where);
      expect(filtered.length).toBe(2);
      expect(filtered.every((r) => r.status === 'subscribed')).toBe(true);
    });

    it('Should filter with not-equals expression', () => {
      const where = {
        exp: '!=',
        args: [
          { type_code: 'field reference', field: 'status' },
          { type_code: 'value', value: 'subscribed' },
        ],
      } as any;

      const filtered = filterRecords(testRecords, where);
      expect(filtered.length).toBe(2);
      expect(filtered.every((r) => r.status !== 'subscribed')).toBe(true);
    });

    it('Should filter with contains expression', () => {
      const where = {
        exp: 'contains',
        args: [
          { type_code: 'field reference', field: 'email_address' },
          { type_code: 'value', value: 'test.com' },
        ],
      } as any;

      const filtered = filterRecords(testRecords, where);
      expect(filtered.length).toBe(3);
    });

    it('Should filter with is-set expression', () => {
      const where = {
        exp: 'is-set',
        args: [{ type_code: 'field reference', field: 'last_changed' }],
      } as any;

      const filtered = filterRecords(testRecords, where);
      expect(filtered.length).toBe(3);
      expect(filtered.every((r) => r.last_changed !== null)).toBe(true);
    });

    it('Should filter with is-not-set expression', () => {
      const where = {
        exp: 'is-not-set',
        args: [{ type_code: 'field reference', field: 'last_changed' }],
      } as any;

      const filtered = filterRecords(testRecords, where);
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('3');
    });

    it('Should filter with greater-than expression', () => {
      const where = {
        exp: '>',
        args: [
          { type_code: 'field reference', field: 'member_rating' },
          { type_code: 'value', value: 3 },
        ],
      } as any;

      const filtered = filterRecords(testRecords, where);
      expect(filtered.length).toBe(2);
      expect(filtered.map((r) => r.id).sort()).toEqual(['1', '3']);
    });

    it('Should filter with less-than expression', () => {
      const where = {
        exp: '<',
        args: [
          { type_code: 'field reference', field: 'member_rating' },
          { type_code: 'value', value: 4 },
        ],
      } as any;

      const filtered = filterRecords(testRecords, where);
      expect(filtered.length).toBe(2);
      expect(filtered.map((r) => r.id).sort()).toEqual(['2', '4']);
    });

    it('Should filter with greater-than-or-equal expression', () => {
      const where = {
        exp: '>=',
        args: [
          { type_code: 'field reference', field: 'member_rating' },
          { type_code: 'value', value: 4 },
        ],
      } as any;

      const filtered = filterRecords(testRecords, where);
      expect(filtered.length).toBe(2);
      expect(filtered.map((r) => r.id).sort()).toEqual(['1', '3']);
    });

    it('Should filter with less-than-or-equal expression', () => {
      const where = {
        exp: '<=',
        args: [
          { type_code: 'field reference', field: 'member_rating' },
          { type_code: 'value', value: 3 },
        ],
      } as any;

      const filtered = filterRecords(testRecords, where);
      expect(filtered.length).toBe(2);
      expect(filtered.map((r) => r.id).sort()).toEqual(['2', '4']);
    });

    it('Should filter with AND expression', () => {
      const where = {
        exp: '&&',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: 'subscribed' },
            ],
          },
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'vip' },
              { type_code: 'value', value: true },
            ],
          },
        ],
      } as any;

      const filtered = filterRecords(testRecords, where);
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('1');
    });

    it('Should filter with OR expression', () => {
      const where = {
        exp: '||',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'vip' },
              { type_code: 'value', value: true },
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

      const filtered = filterRecords(testRecords, where);
      expect(filtered.length).toBe(2);
      expect(filtered.map((r) => r.id).sort()).toEqual(['1', '4']);
    });

    it('Should return all records when where is undefined', () => {
      const filtered = filterRecords(testRecords, undefined);
      expect(filtered.length).toBe(4);
    });
  });

  describe('Should test client-side sorting (unit tests)', () => {
    const testRecords = [
      { id: '1', email_address: 'bob@test.com', member_rating: 3, last_changed: '2026-02-01' },
      { id: '2', email_address: 'alice@test.com', member_rating: 5, last_changed: '2026-01-15' },
      { id: '3', email_address: 'carol@test.com', member_rating: 4, last_changed: null },
      { id: '4', email_address: 'dave@test.com', member_rating: 2, last_changed: '2026-02-10' },
    ];

    it('Should sort by email ascending', () => {
      const sorted = sortRecords(testRecords, { field: 'email_address', direction: 'asc' });
      expect(sorted.map((r) => r.email_address)).toEqual([
        'alice@test.com', 'bob@test.com', 'carol@test.com', 'dave@test.com',
      ]);
    });

    it('Should sort by member_rating descending', () => {
      const sorted = sortRecords(testRecords, { field: 'member_rating', direction: 'desc' });
      expect(sorted.map((r) => r.member_rating)).toEqual([5, 4, 3, 2]);
    });

    it('Should sort by date with nulls at end', () => {
      const sorted = sortRecords(testRecords, { field: 'last_changed', direction: 'asc' });
      expect(sorted.map((r) => r.id)).toEqual(['2', '1', '4', '3']);
    });

    it('Should return unsorted when orderBy is undefined', () => {
      const sorted = sortRecords(testRecords, undefined);
      expect(sorted).toEqual(testRecords);
    });
  });

  describe('Should test server filter extraction (unit tests)', () => {
    it('Should extract status filter', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'status' },
          { type_code: 'value', value: 'subscribed' },
        ],
      } as any;

      const { serverFilters, clientWhere } = extractServerFilters(where);
      expect(serverFilters.status).toBe('subscribed');
      expect(clientWhere).toBeUndefined();
    });

    it('Should extract vip filter', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'vip' },
          { type_code: 'value', value: true },
        ],
      } as any;

      const { serverFilters } = extractServerFilters(where);
      expect(serverFilters.vip_only).toBe(true);
    });

    it('Should extract date filter for last_changed', () => {
      const where = {
        exp: '>',
        args: [
          { type_code: 'field reference', field: 'last_changed' },
          { type_code: 'value', value: '2026-01-01' },
        ],
      } as any;

      const { serverFilters } = extractServerFilters(where);
      expect(serverFilters.since_last_changed).toBe('2026-01-01');
    });

    it('Should extract before_last_changed for < operator', () => {
      const where = {
        exp: '<',
        args: [
          { type_code: 'field reference', field: 'last_changed' },
          { type_code: 'value', value: '2026-03-01' },
        ],
      } as any;

      const { serverFilters } = extractServerFilters(where);
      expect(serverFilters.before_last_changed).toBe('2026-03-01');
    });

    it('Should extract email_type filter', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'email_type' },
          { type_code: 'value', value: 'html' },
        ],
      } as any;

      const { serverFilters, clientWhere } = extractServerFilters(where);
      expect(serverFilters.email_type).toBe('html');
      expect(clientWhere).toBeUndefined();
    });

    it('Should separate server and client filters from AND condition', () => {
      const where = {
        exp: '&&',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: 'subscribed' },
            ],
          },
          {
            exp: 'contains',
            args: [
              { type_code: 'field reference', field: 'email_address' },
              { type_code: 'value', value: 'test.com' },
            ],
          },
        ],
      } as any;

      const { serverFilters, clientWhere } = extractServerFilters(where);
      expect(serverFilters.status).toBe('subscribed');
      expect(clientWhere).toBeDefined();
      expect(clientWhere!.exp).toBe('contains');
    });

    it('Should send OR conditions to client-side', () => {
      const where = {
        exp: '||',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: 'subscribed' },
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

      const { serverFilters, clientWhere } = extractServerFilters(where);
      // OR cannot be split to server-side, so everything goes to client
      expect(Object.keys(serverFilters).length).toBe(0);
      expect(clientWhere).toBeDefined();
      expect(clientWhere!.exp).toBe('||');
    });

    it('Should convert server filters to API params', () => {
      const params = serverFiltersToParams({
        status: 'subscribed',
        vip_only: true,
        since_last_changed: '2026-01-01',
      });

      expect(params.status).toBe('subscribed');
      expect(params.vip_only).toBe('true');
      expect(params.since_last_changed).toBe('2026-01-01');
    });

    it('Should return empty when no where condition', () => {
      const { serverFilters, clientWhere } = extractServerFilters(undefined);
      expect(Object.keys(serverFilters).length).toBe(0);
      expect(clientWhere).toBeUndefined();
    });
  });

  // --- Integration Tests ---

  describe('Should test Mailchimp record-based helpers (integration tests)', () => {
    const baseContext = {
      conn_opts: {
        token: '',
        datacenter: '',
      } as any,
    };

    let hasCredentials = false;

    beforeAll(() => {
      const token = process.env.MAILCHIMP_TOKEN;
      const datacenter = process.env.MAILCHIMP_DATACENTER;

      if (!token || !datacenter) {
        console.warn('MAILCHIMP_TOKEN or MAILCHIMP_DATACENTER not set, skipping integration tests');
        return;
      }

      hasCredentials = true;
      baseContext.conn_opts.token = token;
      baseContext.conn_opts.datacenter = datacenter;
    });

    afterEach(async () => {
      if (hasCredentials) {
        await delay(300);
      }
    });

    let tableName: string | undefined;
    let createdEmail: string | undefined;
    // MAILCHIMP_TEST_EMAIL must be a real, deliverable email address that Mailchimp accepts
    const testEmail = process.env.MAILCHIMP_TEST_EMAIL;

    it('Should get table list (all audiences)', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: credentials not set');
        return;
      }

      clearMappingsCache();
      const tables = await getMailchimpTableList(baseContext);

      expect(tables).toBeDefined();
      expect(Array.isArray(tables)).toBe(true);
      expect(tables.length).toBeGreaterThan(0);

      tableName = tables[0];
      console.log('Available audiences:', tables);
    });

    it('Should get record type for an audience', async () => {
      if (!hasCredentials || !tableName) {
        console.warn('Skipping: credentials or table not available');
        return;
      }

      const recordType = await getMailchimpRecordType(baseContext, tableName);

      expect(recordType).toBeDefined();
      expect(recordType.type).toBe('hash');

      if (recordType.type !== 'hash' || !('fields' in recordType) || !recordType.fields) {
        throw new Error('Record type should be a hash with fields');
      }

      const { fields } = recordType;

      // Check standard fields
      expect(fields.id).toBeDefined();
      expect(fields.email_address).toBeDefined();
      expect(fields.status).toBeDefined();
      expect(fields.vip).toBeDefined();
      expect(fields.member_rating).toBeDefined();
      expect(fields.tags).toBeDefined();
      expect(fields.avg_open_rate).toBeDefined();
      expect(fields.avg_click_rate).toBeDefined();
      expect(fields.location_country_code).toBeDefined();

      // Check field types
      expect((fields.id as any).type).toBe('string');
      expect((fields.vip as any).type).toBe('bool');
      expect((fields.member_rating as any).type).toBe('int');

      // Check for merge fields (prefixed with cf_)
      const mergeFieldKeys = Object.keys(fields).filter((key) => key.startsWith('cf_'));
      console.log('Merge fields found:', mergeFieldKeys);

      // Most audiences have at least FNAME and LNAME
      if (mergeFieldKeys.length > 0) {
        expect((fields[mergeFieldKeys[0]] as any).type).toBeDefined();
      }
    });

    it('Should search records (members) in an audience', async () => {
      if (!hasCredentials || !tableName) {
        console.warn('Skipping: credentials or table not available');
        return;
      }

      const iterator = await searchMailchimpRecords(baseContext, undefined, { table: tableName });

      expect(iterator).toBeDefined();
      expect(typeof iterator).toBe('function');

      const batch = await iterator(baseContext, 10);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);

        if (records.length > 0) {
          expect(records[0].id).toBeDefined();
          expect(records[0].email_address).toBeDefined();
          expect(records[0].status).toBeDefined();
        }
      }
    });

    it('Should search for members with email contains filter', async () => {
      if (!hasCredentials || !tableName) {
        console.warn('Skipping: credentials or table not available');
        return;
      }

      // Search all members first to get an existing email to filter on
      const allIterator = await searchMailchimpRecords(baseContext, undefined, { table: tableName });
      const allBatch = await allIterator(baseContext, 10);
      expect(allBatch).toBeDefined();

      const allRecords = mapColumnFormatToObject(allBatch!);
      expect(allRecords.length).toBeGreaterThan(0);

      const existingEmail = allRecords[0].email_address as string;

      // Now search with a contains filter on that email
      const where = {
        exp: 'contains',
        args: [
          { type_code: 'field reference', field: 'email_address' },
          { type_code: 'value', value: existingEmail },
        ],
      } as any;

      const iterator = await searchMailchimpRecords(baseContext, where, { table: tableName });
      const batch = await iterator(baseContext, 100);

      expect(batch).toBeDefined();
      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(records.length).toBeGreaterThanOrEqual(1);
        expect(records.some((r) => r.email_address === existingEmail)).toBe(true);
      }
    });

    it('Should require WHERE condition for delete', async () => {
      if (!hasCredentials || !tableName) {
        console.warn('Skipping: credentials or table not available');
        return;
      }

      await expect(
        deleteMailchimpRecords(baseContext, undefined, { table: tableName })
      ).rejects.toThrow('WHERE condition is required');
    });

    it('Should handle non-existent audience gracefully', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: credentials not set');
        return;
      }

      await expect(
        getMailchimpRecordType(baseContext, 'NonExistentAudience12345')
      ).rejects.toThrow(MailchimpError);
    });

    it('Should search with sorting', async () => {
      if (!hasCredentials || !tableName) {
        console.warn('Skipping: credentials or table not available');
        return;
      }

      const iterator = await searchMailchimpRecords(baseContext, undefined, {
        table: tableName,
        orderBy: { field: 'email_address', direction: 'asc' },
      });

      const batch = await iterator(baseContext, 10);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);

        // Verify ascending order
        if (records.length > 1) {
          for (let i = 1; i < records.length; i++) {
            expect(
              String(records[i].email_address).localeCompare(String(records[i - 1].email_address))
            ).toBeGreaterThanOrEqual(0);
          }
        }
      }
    });

    it('Should cache audience list mappings', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: credentials not set');
        return;
      }

      clearMappingsCache();

      const tables1 = await getMailchimpTableList(baseContext);
      expect(tables1).toBeDefined();

      // Second call should use cache
      const tables2 = await getMailchimpTableList(baseContext);
      expect(tables2).toBeDefined();

      expect(tables1).toEqual(tables2);
    });

    it('Should search with server-side status filter', async () => {
      if (!hasCredentials || !tableName) {
        console.warn('Skipping: credentials or table not available');
        return;
      }

      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'status' },
          { type_code: 'value', value: 'subscribed' },
        ],
      } as any;

      const iterator = await searchMailchimpRecords(baseContext, where, { table: tableName });
      const batch = await iterator(baseContext, 100);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        // All returned records should be subscribed
        expect(records.every((r) => r.status === 'subscribed')).toBe(true);
      }
    });

    it('Should exhaust iterator and return null on subsequent calls', async () => {
      if (!hasCredentials || !tableName) {
        console.warn('Skipping: credentials or table not available');
        return;
      }

      const iterator = await searchMailchimpRecords(baseContext, undefined, {
        table: tableName,
        limit: 2,
      });

      // Fetch with a small block size to force pagination
      const batch1 = await iterator(baseContext, 1);
      expect(batch1).toBeDefined();

      // Keep iterating until exhausted
      let batch = batch1;
      while (batch) {
        batch = await iterator(baseContext, 1);
      }

      // After exhaustion, should return null
      const exhausted = await iterator(baseContext, 1);
      expect(exhausted).toBeNull();
    });

    // --- Negative tests: missing table name ---

    it('Should throw when searching without table name', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: credentials not set');
        return;
      }

      await expect(
        searchMailchimpRecords(baseContext, undefined, {} as any)
      ).rejects.toThrow('Table name');
    });

    it('Should throw when creating without table name', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: credentials not set');
        return;
      }

      await expect(
        createMailchimpRecords(baseContext, { email_address: ['test@test.com'] }, {} as any)
      ).rejects.toThrow('Table name');
    });

    it('Should throw when updating without table name', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: credentials not set');
        return;
      }

      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'email_address' },
          { type_code: 'value', value: 'test@test.com' },
        ],
      } as any;

      await expect(
        updateMailchimpRecords(baseContext, { cf_FNAME: 'Test' }, where, {} as any)
      ).rejects.toThrow('Table name');
    });

    it('Should throw when deleting without table name', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: credentials not set');
        return;
      }

      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'email_address' },
          { type_code: 'value', value: 'test@test.com' },
        ],
      } as any;

      await expect(
        deleteMailchimpRecords(baseContext, where, {} as any)
      ).rejects.toThrow('Table name');
    });

    it('Should throw when upserting without table name', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: credentials not set');
        return;
      }

      await expect(
        upsertMailchimpRecords(baseContext, { email_address: ['test@test.com'] }, {} as any)
      ).rejects.toThrow('Table name');
    });

    // --- Negative tests: missing email ---

    it('Should throw when creating without email_address', async () => {
      if (!hasCredentials || !tableName) {
        console.warn('Skipping: credentials or table not available');
        return;
      }

      await expect(
        createMailchimpRecords(baseContext, { status: ['subscribed'] }, { table: tableName })
      ).rejects.toThrow('email_address is required');
    });

    it('Should throw when upserting without email_address', async () => {
      if (!hasCredentials || !tableName) {
        console.warn('Skipping: credentials or table not available');
        return;
      }

      await expect(
        upsertMailchimpRecords(baseContext, { status: ['subscribed'] }, { table: tableName })
      ).rejects.toThrow('email_address is required');
    });

    // --- Non-matching WHERE tests ---

    it('Should return 0 when updating non-matching members', async () => {
      if (!hasCredentials || !tableName) {
        console.warn('Skipping: credentials or table not available');
        return;
      }

      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'email_address' },
          { type_code: 'value', value: 'absolutely-does-not-exist-99999@nonexistent-domain-xyz.com' },
        ],
      } as any;

      const count = await updateMailchimpRecords(
        baseContext,
        { cf_FNAME: 'NoMatch' },
        where,
        { table: tableName }
      );

      expect(count).toBe(0);
    });

    it('Should return 0 when deleting non-matching members', async () => {
      if (!hasCredentials || !tableName) {
        console.warn('Skipping: credentials or table not available');
        return;
      }

      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'email_address' },
          { type_code: 'value', value: 'absolutely-does-not-exist-99999@nonexistent-domain-xyz.com' },
        ],
      } as any;

      const count = await deleteMailchimpRecords(baseContext, where, { table: tableName });
      expect(count).toBe(0);
    });

    // Write tests require MAILCHIMP_TEST_EMAIL — a real deliverable email address
    it('Should create a member via createMailchimpRecords', async () => {
      if (!hasCredentials || !tableName || !testEmail) {
        console.warn('Skipping: MAILCHIMP_TEST_EMAIL not set');
        return;
      }

      createdEmail = testEmail;

      const records = {
        email_address: [createdEmail],
        status: ['subscribed'],
        cf_FNAME: ['TestRecord'],
        cf_LNAME: ['RecordBased'],
      };

      const created = await createMailchimpRecords(baseContext, records, { table: tableName });

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(Array.isArray(created.id)).toBe(true);
      expect(created.id.length).toBe(1);
      expect(created.email_address[0]).toBe(createdEmail);
    });

    it('Should find the created member via search', async () => {
      if (!hasCredentials || !tableName || !createdEmail) {
        console.warn('Skipping: prerequisites not met (no MAILCHIMP_TEST_EMAIL)');
        return;
      }

      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'email_address' },
          { type_code: 'value', value: createdEmail },
        ],
      } as any;

      const iterator = await searchMailchimpRecords(baseContext, where, { table: tableName });
      const batch = await iterator(baseContext, 100);

      expect(batch).toBeDefined();
      const records = mapColumnFormatToObject(batch!);
      expect(records.length).toBe(1);
      expect(records[0].email_address).toBe(createdEmail);
      expect(records[0].cf_FNAME).toBe('TestRecord');
      expect(records[0].cf_LNAME).toBe('RecordBased');
    });

    it('Should update the created member and verify changes', async () => {
      if (!hasCredentials || !tableName || !createdEmail) {
        console.warn('Skipping: prerequisites not met (no MAILCHIMP_TEST_EMAIL)');
        return;
      }

      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'email_address' },
          { type_code: 'value', value: createdEmail },
        ],
      } as any;

      const updateCount = await updateMailchimpRecords(
        baseContext,
        { cf_FNAME: 'UpdatedName' },
        where,
        { table: tableName }
      );

      expect(updateCount).toBe(1);

      // Verify the update took effect
      const iterator = await searchMailchimpRecords(baseContext, where, { table: tableName });
      const batch = await iterator(baseContext, 100);

      expect(batch).toBeDefined();
      const records = mapColumnFormatToObject(batch!);
      expect(records.length).toBe(1);
      expect(records[0].cf_FNAME).toBe('UpdatedName');
    });

    it('Should upsert the existing member (update)', async () => {
      if (!hasCredentials || !tableName || !createdEmail) {
        console.warn('Skipping: prerequisites not met (no MAILCHIMP_TEST_EMAIL)');
        return;
      }

      const records = {
        email_address: [createdEmail],
        status: ['subscribed'],
        cf_FNAME: ['UpsertUpdated'],
      };

      const results = await upsertMailchimpRecords(baseContext, records, { table: tableName });

      expect(results).toBeDefined();
      expect(results.length).toBe(1);
      expect(results[0]).toBe('updated');
    });

    it('Should delete (archive) the created member', async () => {
      if (!hasCredentials || !tableName || !createdEmail) {
        console.warn('Skipping: prerequisites not met (no MAILCHIMP_TEST_EMAIL)');
        return;
      }

      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'email_address' },
          { type_code: 'value', value: createdEmail },
        ],
      } as any;

      const deleteCount = await deleteMailchimpRecords(baseContext, where, { table: tableName });

      expect(deleteCount).toBe(1);

      // Verify the member is no longer found
      const iterator = await searchMailchimpRecords(baseContext, {
        exp: '&&',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'email_address' },
              { type_code: 'value', value: createdEmail },
            ],
          },
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: 'subscribed' },
            ],
          },
        ],
      } as any, { table: tableName });
      const batch = await iterator(baseContext, 100);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(records.filter((r) => r.email_address === createdEmail).length).toBe(0);
      }
    });
  });
});
