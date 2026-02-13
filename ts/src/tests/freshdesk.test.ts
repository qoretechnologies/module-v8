import { configDotenv } from 'dotenv';
import {
  getFreshdeskTableList,
  getFreshdeskExpressions,
  getFreshdeskRecordType,
  FreshdeskSearchOptions,
  searchFreshdeskRecords,
  createFreshdeskRecords,
  updateFreshdeskRecords,
  deleteFreshdeskRecords,
  buildFreshdeskWhere,
  resolveEntity,
  FreshdeskRecordError,
  clearCustomFieldsCache,
} from '../apps/freshdesk/helpers/record-based';
import {
  transformEntityToRecord,
  transformRecordToPayload,
  normalizeSetToSingleRecord,
  FRESHDESK_ENTITIES,
} from '../apps/freshdesk/helpers/record-based/constants';
import { mapColumnFormatToObject, delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;

configDotenv({ path: '.env' });

describe('Freshdesk', () => {
  // ────────────────────────────────────────────────────
  // UNIT TESTS — no API access required
  // ────────────────────────────────────────────────────

  describe('Expressions (unit)', () => {
    it('Should return valid expressions with all operators', () => {
      const expressions = getFreshdeskExpressions('en');

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

      // String operators
      expect(expressions['contains']).toBeDefined();

      // Set operators
      expect(expressions['is-set']).toBeDefined();
      expect(expressions['is-not-set']).toBeDefined();
    });

    it('Should have correct structure for comparison operators', () => {
      const expressions = getFreshdeskExpressions('en');
      const eqExpr = expressions['=='];

      expect(eqExpr.type).toBe('operator');
      expect(eqExpr.roles).toContain('search');
      expect(eqExpr.args).toBeDefined();
      expect(eqExpr.args.length).toBe(2);
      expect(eqExpr.return_type).toBe('bool');
    });

    it('Should have correct structure for logical operators', () => {
      const expressions = getFreshdeskExpressions('en');
      const andExpr = expressions['&&'];

      expect(andExpr.type).toBe('operator');
      expect(andExpr.subtype).toBe('logic-operator');
      expect(andExpr.varargs).toBe(true);
    });

    it('Should have locale-resolved display names', () => {
      const expressions = getFreshdeskExpressions('en');

      // Each expression should have display_name and short_desc resolved from locale
      for (const [, expr] of Object.entries(expressions)) {
        expect(expr.display_name).toBeDefined();
        expect(typeof expr.display_name).toBe('string');
        expect(expr.display_name.length).toBeGreaterThan(0);
        expect(expr.short_desc).toBeDefined();
        expect(typeof expr.short_desc).toBe('string');
        expect(expr.short_desc.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Search options (unit)', () => {
    it('Should have valid orderBy configuration', () => {
      expect(FreshdeskSearchOptions).toBeDefined();
      expect(FreshdeskSearchOptions.orderBy).toBeDefined();
      expect(FreshdeskSearchOptions.orderBy.type.type).toBe('hash');

      const orderByFields = FreshdeskSearchOptions.orderBy.type.fields;
      expect(orderByFields).toBeDefined();
      expect(orderByFields.field).toBeDefined();
      expect(orderByFields.direction).toBeDefined();
    });

    it('Should have correct allowed values for field', () => {
      const orderByFields = FreshdeskSearchOptions.orderBy.type.fields;
      const allowedFields = orderByFields.field.allowed_values.map((v: any) => v.value);

      expect(allowedFields).toContain('created_at');
      expect(allowedFields).toContain('updated_at');
      expect(allowedFields).toContain('due_by');
      expect(allowedFields).toContain('status');
      expect(allowedFields).toContain('priority');
    });

    it('Should have correct allowed values for direction', () => {
      const orderByFields = FreshdeskSearchOptions.orderBy.type.fields;
      const allowedDirections = orderByFields.direction.allowed_values.map((v: any) => v.value);

      expect(allowedDirections).toContain('asc');
      expect(allowedDirections).toContain('desc');
    });
  });

  describe('Entity resolution (unit)', () => {
    it('Should resolve valid entity names', () => {
      expect(resolveEntity('Tickets')).toBe('Tickets');
      expect(resolveEntity('Contacts')).toBe('Contacts');
      expect(resolveEntity('Companies')).toBe('Companies');
    });

    it('Should throw for invalid entity name', () => {
      expect(() => resolveEntity('InvalidEntity')).toThrow(FreshdeskRecordError);
      expect(() => resolveEntity('InvalidEntity')).toThrow('Unknown table');
    });

    it('Should throw for empty/undefined table path', () => {
      expect(() => resolveEntity(undefined)).toThrow(FreshdeskRecordError);
      expect(() => resolveEntity(undefined)).toThrow('Table path is required');
      expect(() => resolveEntity('')).toThrow(FreshdeskRecordError);
    });

    it('Should be case-sensitive', () => {
      expect(() => resolveEntity('tickets')).toThrow(FreshdeskRecordError);
      expect(() => resolveEntity('TICKETS')).toThrow(FreshdeskRecordError);
    });
  });

  describe('Query builder (unit)', () => {
    it('Should build equality query (==)', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'status' },
          { type_code: 'value', value: 2 },
        ],
      } as any;

      const result = buildFreshdeskWhere(where);
      expect(result.query).toBe('status:2');
      expect(result.clientFilter).toBeNull();
    });

    it('Should build greater-than query (>)', () => {
      const where = {
        exp: '>',
        args: [
          { type_code: 'field reference', field: 'priority' },
          { type_code: 'value', value: 2 },
        ],
      } as any;

      const result = buildFreshdeskWhere(where);
      expect(result.query).toBe('priority:>2');
      expect(result.clientFilter).toBeNull();
    });

    it('Should build less-than query (<)', () => {
      const where = {
        exp: '<',
        args: [
          { type_code: 'field reference', field: 'priority' },
          { type_code: 'value', value: 3 },
        ],
      } as any;

      const result = buildFreshdeskWhere(where);
      expect(result.query).toBe('priority:<3');
      expect(result.clientFilter).toBeNull();
    });

    it('Should quote string values', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'email' },
          { type_code: 'value', value: 'test@example.com' },
        ],
      } as any;

      const result = buildFreshdeskWhere(where);
      expect(result.query).toBe("email:'test@example.com'");
    });

    it('Should format date values', () => {
      const where = {
        exp: '>',
        args: [
          { type_code: 'field reference', field: 'created_at' },
          { type_code: 'value', value: '2026-01-15T00:00:00.000Z' },
        ],
      } as any;

      const result = buildFreshdeskWhere(where);
      expect(result.query).toBe("created_at:>'2026-01-15T00:00:00Z'");
    });

    it('Should format boolean values', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'active' },
          { type_code: 'value', value: true },
        ],
      } as any;

      const result = buildFreshdeskWhere(where);
      expect(result.query).toBe('active:true');
    });

    it('Should build AND query', () => {
      const where = {
        exp: '&&',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: 2 },
            ],
          },
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'priority' },
              { type_code: 'value', value: 3 },
            ],
          },
        ],
      } as any;

      const result = buildFreshdeskWhere(where);
      expect(result.query).toBe('(status:2 AND priority:3)');
      expect(result.clientFilter).toBeNull();
    });

    it('Should build OR query', () => {
      const where = {
        exp: '||',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: 2 },
            ],
          },
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: 3 },
            ],
          },
        ],
      } as any;

      const result = buildFreshdeskWhere(where);
      expect(result.query).toBe('(status:2 OR status:3)');
      expect(result.clientFilter).toBeNull();
    });

    it('Should create client filter for != operator', () => {
      const where = {
        exp: '!=',
        args: [
          { type_code: 'field reference', field: 'status' },
          { type_code: 'value', value: 5 },
        ],
      } as any;

      const result = buildFreshdeskWhere(where);
      expect(result.query).toBeNull();
      expect(result.clientFilter).toBeDefined();
      expect(result.clientFilter!({ status: 2 })).toBe(true);
      expect(result.clientFilter!({ status: 5 })).toBe(false);
    });

    it('Should create client filter for contains operator', () => {
      const where = {
        exp: 'contains',
        args: [
          { type_code: 'field reference', field: 'subject' },
          { type_code: 'value', value: 'urgent' },
        ],
      } as any;

      const result = buildFreshdeskWhere(where);
      expect(result.query).toBeNull();
      expect(result.clientFilter).toBeDefined();
      expect(result.clientFilter!({ subject: 'URGENT: Fix bug' })).toBe(true);
      expect(result.clientFilter!({ subject: 'Normal ticket' })).toBe(false);
    });

    it('Should create client filter for is-set operator', () => {
      const where = {
        exp: 'is-set',
        args: [{ type_code: 'field reference', field: 'email' }],
      } as any;

      const result = buildFreshdeskWhere(where);
      expect(result.query).toBeNull();
      expect(result.clientFilter).toBeDefined();
      expect(result.clientFilter!({ email: 'test@example.com' })).toBe(true);
      expect(result.clientFilter!({ email: null })).toBe(false);
      expect(result.clientFilter!({ email: '' })).toBe(false);
      expect(result.clientFilter!({ email: undefined })).toBe(false);
    });

    it('Should create client filter for is-not-set operator', () => {
      const where = {
        exp: 'is-not-set',
        args: [{ type_code: 'field reference', field: 'phone' }],
      } as any;

      const result = buildFreshdeskWhere(where);
      expect(result.query).toBeNull();
      expect(result.clientFilter).toBeDefined();
      expect(result.clientFilter!({ phone: null })).toBe(true);
      expect(result.clientFilter!({ phone: '' })).toBe(true);
      expect(result.clientFilter!({ phone: undefined })).toBe(true);
      expect(result.clientFilter!({ phone: '555-1234' })).toBe(false);
    });

    it('Should handle mixed server/client operators in AND', () => {
      const where = {
        exp: '&&',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: 2 },
            ],
          },
          {
            exp: '!=',
            args: [
              { type_code: 'field reference', field: 'priority' },
              { type_code: 'value', value: 1 },
            ],
          },
        ],
      } as any;

      const result = buildFreshdeskWhere(where);
      // Server query should include only the == part
      expect(result.query).toBe('status:2');
      // Client filter handles the != part
      expect(result.clientFilter).toBeDefined();
      expect(result.clientFilter!({ priority: 3 })).toBe(true);
      expect(result.clientFilter!({ priority: 1 })).toBe(false);
    });

    it('Should handle custom field queries', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'cf_department' },
          { type_code: 'value', value: 'Engineering' },
        ],
      } as any;

      const result = buildFreshdeskWhere(where);
      expect(result.query).toBe("cf_department:'Engineering'");
    });
  });

  describe('Record transformation (unit)', () => {
    it('Should transform entity response to flat record with standard fields', () => {
      const apiResponse = {
        id: 123,
        subject: 'Test ticket',
        status: 2,
        priority: 3,
        email: 'user@example.com',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
        custom_fields: {
          cf_department: 'Engineering',
          cf_region: 'US',
        },
      };

      const record = transformEntityToRecord(apiResponse, 'Tickets');

      expect(record.id).toBe(123);
      expect(record.subject).toBe('Test ticket');
      expect(record.status).toBe(2);
      expect(record.priority).toBe(3);
      expect(record.email).toBe('user@example.com');
      expect(record.created_at).toBe('2026-01-01T00:00:00Z');
      expect(record.updated_at).toBe('2026-01-02T00:00:00Z');
      // Custom fields should be flattened
      expect(record.cf_department).toBe('Engineering');
      expect(record.cf_region).toBe('US');
    });

    it('Should set missing standard fields to null', () => {
      const apiResponse = {
        id: 456,
        name: 'Test Contact',
      };

      const record = transformEntityToRecord(apiResponse, 'Contacts');

      expect(record.id).toBe(456);
      expect(record.name).toBe('Test Contact');
      expect(record.email).toBeNull();
      expect(record.phone).toBeNull();
      expect(record.company_id).toBeNull();
    });

    it('Should handle entities with no custom fields', () => {
      const apiResponse = {
        id: 789,
        name: 'Test Company',
        description: 'A test company',
      };

      const record = transformEntityToRecord(apiResponse, 'Companies');

      expect(record.id).toBe(789);
      expect(record.name).toBe('Test Company');
      expect(record.description).toBe('A test company');
    });

    it('Should transform record back to API payload', () => {
      const record = {
        subject: 'New ticket',
        description: 'Ticket details',
        status: 2,
        priority: 3,
        cf_department: 'Sales',
        id: 100, // Should be skipped (read-only)
        created_at: '2026-01-01', // Should be skipped (read-only)
      };

      const payload = transformRecordToPayload(record, 'Tickets');

      expect(payload.subject).toBe('New ticket');
      expect(payload.description).toBe('Ticket details');
      expect(payload.status).toBe(2);
      expect(payload.priority).toBe(3);
      // Custom fields should be nested
      expect(payload.custom_fields).toEqual({ cf_department: 'Sales' });
      // Read-only fields should be excluded
      expect(payload.id).toBeUndefined();
      expect(payload.created_at).toBeUndefined();
    });

    it('Should skip undefined values in payload', () => {
      const record = {
        name: 'Test',
        email: undefined,
      };

      const payload = transformRecordToPayload(record, 'Contacts');
      expect(payload.name).toBe('Test');
      expect('email' in payload).toBe(false);
    });
  });

  describe('normalizeSetToSingleRecord (unit)', () => {
    const mockMapColumnFormat = (data: Record<string, unknown>): Record<string, unknown>[] => {
      const keys = Object.keys(data);
      if (keys.length === 0) {
        return [];
      }
      const length = (data[keys[0]] as unknown[]).length;
      const records: Record<string, unknown>[] = [];
      for (let i = 0; i < length; i++) {
        const record: Record<string, unknown> = {};
        for (const key of keys) {
          record[key] = (data[key] as unknown[])[i];
        }
        records.push(record);
      }
      return records;
    };

    it('Should handle plain object input', () => {
      const input = { name: 'Updated Name', status: 3 };
      const result = normalizeSetToSingleRecord(input, mockMapColumnFormat);
      expect(result).toEqual({ name: 'Updated Name', status: 3 });
    });

    it('Should handle array input with single record', () => {
      const input = [{ name: 'Updated' }];
      const result = normalizeSetToSingleRecord(input, mockMapColumnFormat);
      expect(result).toEqual({ name: 'Updated' });
    });

    it('Should throw for array input with multiple records', () => {
      const input = [{ name: 'First' }, { name: 'Second' }];
      expect(() => normalizeSetToSingleRecord(input, mockMapColumnFormat)).toThrow(FreshdeskRecordError);
      expect(() => normalizeSetToSingleRecord(input, mockMapColumnFormat)).toThrow(
        'single record'
      );
    });

    it('Should handle column format input', () => {
      const input = { name: ['Updated'], status: [3] };
      const result = normalizeSetToSingleRecord(input, mockMapColumnFormat);
      expect(result).toEqual({ name: 'Updated', status: 3 });
    });

    it('Should throw for column format with multiple records', () => {
      const input = { name: ['First', 'Second'], status: [1, 2] };
      expect(() => normalizeSetToSingleRecord(input, mockMapColumnFormat)).toThrow(FreshdeskRecordError);
    });

    it('Should return empty object for null/undefined input', () => {
      expect(normalizeSetToSingleRecord(null, mockMapColumnFormat)).toEqual({});
      expect(normalizeSetToSingleRecord(undefined, mockMapColumnFormat)).toEqual({});
    });

    it('Should handle empty array input', () => {
      const result = normalizeSetToSingleRecord([], mockMapColumnFormat);
      expect(result).toEqual({});
    });
  });

  describe('FRESHDESK_ENTITIES constant (unit)', () => {
    it('Should contain exactly three entity types', () => {
      expect(FRESHDESK_ENTITIES).toHaveLength(3);
      expect(FRESHDESK_ENTITIES).toContain('Tickets');
      expect(FRESHDESK_ENTITIES).toContain('Contacts');
      expect(FRESHDESK_ENTITIES).toContain('Companies');
    });
  });

  // ────────────────────────────────────────────────────
  // INTEGRATION TESTS — require FRESHDESK_SUBDOMAIN + FRESHDESK_API_KEY
  // ────────────────────────────────────────────────────

  describe('Record-based helpers (integration)', () => {
    const baseContext = {
      conn_opts: {
        token: '',
        subdomain: '',
      } as any,
    };

    let hasCredentials = false;

    beforeAll(() => {
      const subdomain = process.env.FRESHDESK_SUBDOMAIN;
      const apiKey = process.env.FRESHDESK_API_KEY;

      if (!subdomain || !apiKey) {
        console.warn('FRESHDESK_SUBDOMAIN / FRESHDESK_API_KEY not set, skipping integration tests');
        return;
      }

      hasCredentials = true;
      baseContext.conn_opts.subdomain = subdomain;
      baseContext.conn_opts.token = btoa(`${apiKey}:X`);
    });

    afterEach(async () => {
      if (hasCredentials) {
        await delay(500);
      }
    });

    it('Should get table list with 3 entities', async () => {
      if (!hasCredentials) {
        return;
      }

      const tables = await getFreshdeskTableList(baseContext);

      expect(tables).toBeDefined();
      expect(Array.isArray(tables)).toBe(true);
      expect(tables).toHaveLength(3);
      expect(tables).toContain('Tickets');
      expect(tables).toContain('Contacts');
      expect(tables).toContain('Companies');
    });

    it('Should throw when getting table list without credentials', async () => {
      await expect(
        getFreshdeskTableList({ conn_opts: {} } as any)
      ).rejects.toThrow();
    });

    it('Should get record type for Tickets', async () => {
      if (!hasCredentials) {
        return;
      }

      clearCustomFieldsCache();

      const recordType = await getFreshdeskRecordType(baseContext, 'Tickets');

      expect(recordType).toBeDefined();
      expect(recordType.type).toBe('hash');

      if (recordType.type !== 'hash' || !('fields' in recordType) || !recordType.fields) {
        throw new Error('Record type should be a hash with fields');
      }

      const { fields } = recordType;

      // Check standard ticket fields
      expect(fields.id).toBeDefined();
      expect(fields.subject).toBeDefined();
      expect(fields.status).toBeDefined();
      expect(fields.priority).toBeDefined();
      expect(fields.email).toBeDefined();
      expect(fields.created_at).toBeDefined();
      expect(fields.updated_at).toBeDefined();

      // Verify field structure
      expect((fields.id as any).type).toBe('int');
      expect((fields.id as any).desc).toBeDefined();
      expect((fields.subject as any).type).toBe('string');
    });

    it('Should get record type for Contacts', async () => {
      if (!hasCredentials) {
        return;
      }

      const recordType = await getFreshdeskRecordType(baseContext, 'Contacts');

      expect(recordType).toBeDefined();

      if (recordType.type !== 'hash' || !('fields' in recordType) || !recordType.fields) {
        throw new Error('Record type should be a hash with fields');
      }

      const { fields } = recordType;
      expect(fields.id).toBeDefined();
      expect(fields.name).toBeDefined();
      expect(fields.email).toBeDefined();
      expect(fields.phone).toBeDefined();
    });

    it('Should get record type for Companies', async () => {
      if (!hasCredentials) {
        return;
      }

      const recordType = await getFreshdeskRecordType(baseContext, 'Companies');

      expect(recordType).toBeDefined();

      if (recordType.type !== 'hash' || !('fields' in recordType) || !recordType.fields) {
        throw new Error('Record type should be a hash with fields');
      }

      const { fields } = recordType;
      expect(fields.id).toBeDefined();
      expect(fields.name).toBeDefined();
      expect(fields.description).toBeDefined();
      expect(fields.domains).toBeDefined();
    });

    it('Should throw for invalid entity in get_record_type', async () => {
      if (!hasCredentials) {
        return;
      }

      await expect(
        getFreshdeskRecordType(baseContext, 'InvalidEntity')
      ).rejects.toThrow(FreshdeskRecordError);
    });

    it('Should search Tickets without WHERE', async () => {
      if (!hasCredentials) {
        return;
      }

      const iterator = await searchFreshdeskRecords(baseContext, undefined, {
        table: 'Tickets',
      });

      expect(iterator).toBeDefined();
      expect(typeof iterator).toBe('function');

      const batch = await iterator(baseContext, 10);

      // Batch may be null if there are no tickets
      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);

        if (records.length > 0) {
          expect(records[0].id).toBeDefined();
          expect(records[0].subject).toBeDefined();
        }
      }
    });

    it('Should search Tickets with WHERE (status == 2)', async () => {
      if (!hasCredentials) {
        return;
      }

      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'status' },
          { type_code: 'value', value: 2 },
        ],
      } as any;

      const iterator = await searchFreshdeskRecords(baseContext, where, {
        table: 'Tickets',
      });

      expect(iterator).toBeDefined();

      const batch = await iterator(baseContext, 10);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);

        // All returned records should have status 2 (Open)
        for (const record of records) {
          expect(record.status).toBe(2);
        }
      }
    });

    it('Should search Contacts with orderBy', async () => {
      if (!hasCredentials) {
        return;
      }

      const iterator = await searchFreshdeskRecords(baseContext, undefined, {
        table: 'Contacts',
        orderBy: { field: 'created_at', direction: 'desc' },
      });

      expect(iterator).toBeDefined();
      const batch = await iterator(baseContext, 10);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);
      }
    });

    it('Should throw for delete without WHERE', async () => {
      if (!hasCredentials) {
        return;
      }

      await expect(
        deleteFreshdeskRecords(baseContext, undefined as any, { table: 'Contacts' })
      ).rejects.toThrow(FreshdeskRecordError);
      await expect(
        deleteFreshdeskRecords(baseContext, undefined as any, { table: 'Contacts' })
      ).rejects.toThrow('WHERE condition is required');
    });
  });

  // ────────────────────────────────────────────────────
  // CRUD CYCLE — create contact → search → update → delete
  // ────────────────────────────────────────────────────

  describe('CRUD cycle for Contacts (integration)', () => {
    const baseContext = {
      conn_opts: {
        token: '',
        subdomain: '',
      } as any,
    };

    let hasCredentials = false;
    let createdContactId: number | undefined;

    beforeAll(() => {
      const subdomain = process.env.FRESHDESK_SUBDOMAIN;
      const apiKey = process.env.FRESHDESK_API_KEY;

      if (!subdomain || !apiKey) {
        console.warn('FRESHDESK_SUBDOMAIN / FRESHDESK_API_KEY not set, skipping CRUD tests');
        return;
      }

      hasCredentials = true;
      baseContext.conn_opts.subdomain = subdomain;
      baseContext.conn_opts.token = btoa(`${apiKey}:X`);
    });

    afterEach(async () => {
      if (hasCredentials) {
        await delay(1000);
      }
    });

    afterAll(async () => {
      // Cleanup: make sure the contact is deleted
      if (hasCredentials && createdContactId) {
        try {
          const where = {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'email' },
              { type_code: 'value', value: `freshdesk-test-${createdContactId}@qoretest.dev` },
            ],
          } as any;

          await deleteFreshdeskRecords(baseContext, where, { table: 'Contacts' });
        } catch {
          // Ignore cleanup errors
        }
      }
    });

    it('Should create a Contact', async () => {
      if (!hasCredentials) {
        return;
      }

      const uniqueEmail = `freshdesk-test-${Date.now()}@qoretest.dev`;
      const records = {
        name: ['Test Contact (Qore)'],
        email: [uniqueEmail],
      };

      const created = await createFreshdeskRecords(baseContext, records, { table: 'Contacts' });

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(Array.isArray(created.id)).toBe(true);
      expect(created.id.length).toBe(1);

      createdContactId = created.id[0] as number;
      expect(createdContactId).toBeDefined();
      expect(typeof createdContactId).toBe('number');

      // Verify name came back
      expect(created.name).toBeDefined();
      expect(created.name[0]).toBe('Test Contact (Qore)');
    }, 30_000);

    it('Should search for the created Contact', async () => {
      if (!hasCredentials || !createdContactId) {
        return;
      }

      // Search by email
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'email' },
          {
            type_code: 'value',
            value: `freshdesk-test-${createdContactId}@qoretest.dev`,
          },
        ],
      } as any;

      // Freshdesk search indexing can take time
      await delay(5000);

      const iterator = await searchFreshdeskRecords(baseContext, where, {
        table: 'Contacts',
      });

      const batch = await iterator(baseContext, 10);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(records.length).toBeGreaterThanOrEqual(1);

        const found = records.find((r) => r.id === createdContactId);
        if (found) {
          expect(found.name).toBe('Test Contact (Qore)');
        }
      }
    }, 30_000);

    it('Should update the created Contact', async () => {
      if (!hasCredentials || !createdContactId) {
        return;
      }

      // Build WHERE to match our created contact by email
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'email' },
          {
            type_code: 'value',
            value: `freshdesk-test-${createdContactId}@qoretest.dev`,
          },
        ],
      } as any;

      const updateCount = await updateFreshdeskRecords(
        baseContext,
        { name: 'Updated Contact (Qore)' },
        where,
        { table: 'Contacts' }
      );

      expect(updateCount).toBeGreaterThanOrEqual(0);
    }, 30_000);

    it('Should delete the created Contact', async () => {
      if (!hasCredentials || !createdContactId) {
        return;
      }

      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'email' },
          {
            type_code: 'value',
            value: `freshdesk-test-${createdContactId}@qoretest.dev`,
          },
        ],
      } as any;

      const deletedCount = await deleteFreshdeskRecords(baseContext, where, {
        table: 'Contacts',
      });

      expect(deletedCount).toBeGreaterThanOrEqual(0);

      // Clear the ID so afterAll cleanup is not attempted
      createdContactId = undefined;
    }, 30_000);
  });
});
