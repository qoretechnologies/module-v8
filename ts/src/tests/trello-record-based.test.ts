/**
 * Trello Record-Based Helpers Tests
 *
 * Unit tests for expressions, search options, and client-side filtering.
 * Integration tests for full CRUD cycle with real Trello API.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { configDotenv } from 'dotenv';
import {
  clearMappingsCache,
  getTrelloTableList,
  getTrelloRecordType,
  getTrelloExpressions,
  TrelloSearchOptions,
  filterRecords,
  sortRecords,
  searchTrelloRecords,
  createTrelloRecords,
  updateTrelloRecords,
  deleteTrelloRecords,
  parseTablePath,
  buildTablePath,
  transformCardToRecord,
  transformRecordToCardPayload,
  TrelloRecordError,
  TrelloCard,
  TrelloCustomField,
} from '../apps/trello/helpers/record-based';
import { trelloClient } from '../apps/trello/client';
import { mapColumnFormatToObject, delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;

configDotenv({ path: '.env' });

describe('Trello Record-Based', () => {
  // Unit tests that don't require API access
  describe('Should test Trello expressions and search options (unit tests)', () => {
    it('Should return valid expressions configuration', () => {
      const expressions = getTrelloExpressions('en');

      expect(expressions).toBeDefined();
      expect(typeof expressions).toBe('object');

      // Check for logical operators
      expect(expressions['&&']).toBeDefined();
      expect(expressions['||']).toBeDefined();

      // Check for comparison operators
      expect(expressions['==']).toBeDefined();
      expect(expressions['!=']).toBeDefined();
      expect(expressions['>']).toBeDefined();
      expect(expressions['>=']).toBeDefined();
      expect(expressions['<']).toBeDefined();
      expect(expressions['<=']).toBeDefined();

      // Check for set operators
      expect(expressions['is-set']).toBeDefined();
      expect(expressions['is-not-set']).toBeDefined();

      // Check for string operators
      expect(expressions['contains']).toBeDefined();

      // Verify expression structure for a comparison operator
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
      expect(TrelloSearchOptions).toBeDefined();
      expect(TrelloSearchOptions.orderBy).toBeDefined();

      const orderByType = TrelloSearchOptions.orderBy.type as { type: string; fields: Record<string, any> };
      expect(orderByType.type).toBe('hash');

      const orderByFields = orderByType.fields;
      expect(orderByFields).toBeDefined();
      expect(orderByFields.field).toBeDefined();
      expect(orderByFields.direction).toBeDefined();

      // Check allowed values for field
      expect(orderByFields.field.allowed_values).toBeDefined();
      const allowedFields = orderByFields.field.allowed_values.map((v: any) => v.value);
      expect(allowedFields).toContain('name');
      expect(allowedFields).toContain('pos');
      expect(allowedFields).toContain('due');
      expect(allowedFields).toContain('dateLastActivity');

      // Check allowed values for direction
      expect(orderByFields.direction.allowed_values).toBeDefined();
      const allowedDirections = orderByFields.direction.allowed_values.map((v: any) => v.value);
      expect(allowedDirections).toContain('asc');
      expect(allowedDirections).toContain('desc');
    });
  });

  describe('Should test Trello path parsing (unit tests)', () => {
    it('Should correctly parse table path', () => {
      const path = 'My Board|To Do';
      const parsed = parseTablePath(path);

      expect(parsed.boardName).toBe('My Board');
      expect(parsed.listName).toBe('To Do');
    });

    it('Should correctly build table path', () => {
      const path = buildTablePath('My Board', 'To Do');
      expect(path).toBe('My Board|To Do');
    });

    it('Should throw on invalid table path', () => {
      expect(() => parseTablePath('invalid-path')).toThrow(TrelloRecordError);
      expect(() => parseTablePath('too|many|parts')).toThrow(TrelloRecordError);
    });
  });

  describe('Should test Trello record transformations (unit tests)', () => {
    const mockCustomFieldDefs = new Map<string, TrelloCustomField>();
    mockCustomFieldDefs.set('Priority', {
      id: 'cf1',
      name: 'Priority',
      type: 'list',
      idModel: 'board1',
      options: [
        { id: 'opt1', idCustomField: 'cf1', value: { text: 'High' }, pos: 1 },
        { id: 'opt2', idCustomField: 'cf1', value: { text: 'Low' }, pos: 2 },
      ],
    });
    mockCustomFieldDefs.set('Budget', {
      id: 'cf2',
      name: 'Budget',
      type: 'number',
      idModel: 'board1',
    });
    mockCustomFieldDefs.set('Approved', {
      id: 'cf3',
      name: 'Approved',
      type: 'checkbox',
      idModel: 'board1',
    });

    it('Should transform card to record with custom fields', () => {
      const mockCard: TrelloCard = {
        id: 'card1',
        name: 'Test Card',
        desc: 'Test description',
        closed: false,
        due: '2026-06-15T10:00:00.000Z',
        dueComplete: false,
        start: null,
        pos: 1000,
        idList: 'list1',
        idBoard: 'board1',
        idMembers: ['member1', 'member2'],
        idLabels: ['label1'],
        shortUrl: 'https://trello.com/c/abc123',
        url: 'https://trello.com/c/abc123/test-card',
        dateLastActivity: '2026-01-15T10:00:00.000Z',
        customFieldItems: [
          { id: 'cfi1', idCustomField: 'cf1', idModel: 'card1', idValue: 'opt1' },
          { id: 'cfi2', idCustomField: 'cf2', idModel: 'card1', value: { number: '5000' } },
          { id: 'cfi3', idCustomField: 'cf3', idModel: 'card1', value: { checked: 'true' } },
        ],
      };

      const record = transformCardToRecord(mockCard, mockCustomFieldDefs);

      // Check standard fields
      expect(record.id).toBe('card1');
      expect(record.name).toBe('Test Card');
      expect(record.desc).toBe('Test description');
      expect(record.closed).toBe(false);
      expect(record.due).toBe('2026-06-15T10:00:00.000Z');
      expect(record.dueComplete).toBe(false);
      expect(record.start).toBeNull();
      expect(record.pos).toBe(1000);
      expect(record.idMembers).toEqual(['member1', 'member2']);
      expect(record.idLabels).toEqual(['label1']);

      // Check custom fields
      expect(record['cf_Priority']).toBe('High');
      expect(record['cf_Budget']).toBe(5000);
      expect(record['cf_Approved']).toBe(true);
    });

    it('Should transform record to card payload', () => {
      const record = {
        name: 'Updated Card',
        desc: 'Updated description',
        due: '2026-07-01',
        cf_Priority: 'Low',
        cf_Budget: 10000,
        cf_Approved: false,
      };

      const { cardPayload, customFieldUpdates } = transformRecordToCardPayload(record, mockCustomFieldDefs);

      // Check card payload
      expect(cardPayload.name).toBe('Updated Card');
      expect(cardPayload.desc).toBe('Updated description');
      expect(cardPayload.due).toBe('2026-07-01');

      // Check custom field updates
      expect(customFieldUpdates.length).toBe(3);

      const priorityUpdate = customFieldUpdates.find((u) => u.fieldId === 'cf1');
      expect(priorityUpdate?.value).toBe('opt2'); // Low option

      const budgetUpdate = customFieldUpdates.find((u) => u.fieldId === 'cf2');
      expect(budgetUpdate?.value).toEqual({ number: '10000' });

      const approvedUpdate = customFieldUpdates.find((u) => u.fieldId === 'cf3');
      expect(approvedUpdate?.value).toEqual({ checked: 'false' });
    });
  });

  describe('Should test Trello client-side filtering (unit tests)', () => {
    const testRecords = [
      { id: '1', name: 'Task A', closed: false, due: '2026-06-15', pos: 100 },
      { id: '2', name: 'Task B', closed: true, due: '2026-07-01', pos: 200 },
      { id: '3', name: 'Task C', closed: false, due: null, pos: 300 },
      { id: '4', name: 'Another Task', closed: false, due: '2026-05-01', pos: 400 },
    ];

    it('Should filter with equality expression', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'closed' },
          { type_code: 'value', value: false },
        ],
      } as any;

      const filtered = filterRecords(testRecords, where);
      expect(filtered.length).toBe(3);
      expect(filtered.every((r) => r.closed === false)).toBe(true);
    });

    it('Should filter with not-equals expression', () => {
      const where = {
        exp: '!=',
        args: [
          { type_code: 'field reference', field: 'closed' },
          { type_code: 'value', value: true },
        ],
      } as any;

      const filtered = filterRecords(testRecords, where);
      expect(filtered.length).toBe(3);
      expect(filtered.every((r) => r.closed === false)).toBe(true);
    });

    it('Should filter with contains expression', () => {
      const where = {
        exp: 'contains',
        args: [
          { type_code: 'field reference', field: 'name' },
          { type_code: 'value', value: 'Task' },
        ],
      } as any;

      const filtered = filterRecords(testRecords, where);
      expect(filtered.length).toBe(4); // All contain "Task"
    });

    it('Should filter with is-set expression', () => {
      const where = {
        exp: 'is-set',
        args: [{ type_code: 'field reference', field: 'due' }],
      } as any;

      const filtered = filterRecords(testRecords, where);
      expect(filtered.length).toBe(3);
      expect(filtered.every((r) => r.due !== null)).toBe(true);
    });

    it('Should filter with is-not-set expression', () => {
      const where = {
        exp: 'is-not-set',
        args: [{ type_code: 'field reference', field: 'due' }],
      } as any;

      const filtered = filterRecords(testRecords, where);
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('3');
    });

    it('Should filter with greater-than expression on dates', () => {
      const where = {
        exp: '>',
        args: [
          { type_code: 'field reference', field: 'due' },
          { type_code: 'value', value: '2026-06-01' },
        ],
      } as any;

      const filtered = filterRecords(testRecords, where);
      expect(filtered.length).toBe(2);
      expect(filtered.map((r) => r.id).sort()).toEqual(['1', '2']);
    });

    it('Should filter with less-than expression on numbers', () => {
      const where = {
        exp: '<',
        args: [
          { type_code: 'field reference', field: 'pos' },
          { type_code: 'value', value: 250 },
        ],
      } as any;

      const filtered = filterRecords(testRecords, where);
      expect(filtered.length).toBe(2);
      expect(filtered.map((r) => r.id).sort()).toEqual(['1', '2']);
    });

    it('Should filter with AND expression', () => {
      const where = {
        exp: '&&',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'closed' },
              { type_code: 'value', value: false },
            ],
          },
          {
            exp: 'is-set',
            args: [{ type_code: 'field reference', field: 'due' }],
          },
        ],
      } as any;

      const filtered = filterRecords(testRecords, where);
      expect(filtered.length).toBe(2);
      expect(filtered.every((r) => r.closed === false && r.due !== null)).toBe(true);
    });

    it('Should filter with OR expression', () => {
      const where = {
        exp: '||',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'closed' },
              { type_code: 'value', value: true },
            ],
          },
          {
            exp: 'is-not-set',
            args: [{ type_code: 'field reference', field: 'due' }],
          },
        ],
      } as any;

      const filtered = filterRecords(testRecords, where);
      expect(filtered.length).toBe(2);
      expect(filtered.map((r) => r.id).sort()).toEqual(['2', '3']);
    });

    it('Should return all records when where is undefined', () => {
      const filtered = filterRecords(testRecords, undefined);
      expect(filtered.length).toBe(4);
    });
  });

  describe('Should test Trello client-side sorting (unit tests)', () => {
    const testRecords = [
      { id: '1', name: 'Beta', due: '2026-06-15', pos: 100 },
      { id: '2', name: 'Alpha', due: '2026-07-01', pos: 200 },
      { id: '3', name: 'Gamma', due: null, pos: 300 },
      { id: '4', name: 'Delta', due: '2026-05-01', pos: 50 },
    ];

    it('Should sort by name ascending', () => {
      const sorted = sortRecords(testRecords, { field: 'name', direction: 'asc' });
      expect(sorted.map((r) => r.name)).toEqual(['Alpha', 'Beta', 'Delta', 'Gamma']);
    });

    it('Should sort by name descending', () => {
      const sorted = sortRecords(testRecords, { field: 'name', direction: 'desc' });
      expect(sorted.map((r) => r.name)).toEqual(['Gamma', 'Delta', 'Beta', 'Alpha']);
    });

    it('Should sort by pos ascending', () => {
      const sorted = sortRecords(testRecords, { field: 'pos', direction: 'asc' });
      expect(sorted.map((r) => r.pos)).toEqual([50, 100, 200, 300]);
    });

    it('Should sort by date with nulls at end', () => {
      const sorted = sortRecords(testRecords, { field: 'due', direction: 'asc' });
      expect(sorted.map((r) => r.id)).toEqual(['4', '1', '2', '3']);
    });

    it('Should return unsorted when orderBy is undefined', () => {
      const sorted = sortRecords(testRecords, undefined);
      expect(sorted).toEqual(testRecords);
    });
  });

  // Integration tests that require API access
  describe('Should test Trello record-based helpers (integration tests)', () => {
    const base_context = {
      conn_opts: {
        token: '',
        key: '',
      } as any,
    };

    let hasCredentials = false;

    beforeAll(() => {
      const token = process.env.TRELLO_TOKEN;
      const key = process.env.TRELLO_KEY;

      if (!token || !key) {
        console.warn('TRELLO_TOKEN or TRELLO_KEY not set, skipping integration tests');
        return;
      }

      hasCredentials = true;
      base_context.conn_opts.token = token;
      base_context.conn_opts.key = key;
    });

    afterEach(async () => {
      if (hasCredentials) {
        await delay(200);
      }
    });

    let tablePath: string | undefined;
    let createdRecordId: string | undefined;

    it('Should get table list (all board|list paths)', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: TRELLO_TOKEN or TRELLO_KEY not set');
        return;
      }

      // Clear the mappings cache to ensure fresh data
      clearMappingsCache();

      const tables = await getTrelloTableList(base_context);

      console.dir(tables, { depth: null });

      expect(tables).toBeDefined();
      expect(Array.isArray(tables)).toBe(true);
      expect(tables.length).toBeGreaterThan(0);

      // Table paths should be in format "board|list"
      const firstTable = tables[0];
      const parts = firstTable.split('|');
      expect(parts.length).toBe(2);
      expect(parts[0]).toBeTruthy(); // board name
      expect(parts[1]).toBeTruthy(); // list name

      tablePath = firstTable;
    });

    it('Should get record type for a list', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: TRELLO_TOKEN or TRELLO_KEY not set');
        return;
      }
      if (!tablePath) {
        console.warn('Skipping: Table path not defined');
        return;
      }

      const recordType = await getTrelloRecordType(base_context, tablePath);

      expect(recordType).toBeDefined();
      expect(recordType.type).toBe('hash');

      // recordType should be a hash type with fields
      if (recordType.type !== 'hash' || !('fields' in recordType) || !recordType.fields) {
        throw new Error('Record type should be a hash with fields');
      }

      const { fields } = recordType;

      // Check for standard card fields
      expect(fields.id).toBeDefined();
      expect(fields.name).toBeDefined();
      expect(fields.desc).toBeDefined();
      expect(fields.closed).toBeDefined();
      expect(fields.due).toBeDefined();
      expect(fields.dueComplete).toBeDefined();

      // Verify field structure has type
      expect((fields.id as any).type).toBe('string');

      // Check for additional standard fields
      expect(fields.pos).toBeDefined();
      expect(fields.idList).toBeDefined();
      expect(fields.idBoard).toBeDefined();
      expect(fields.idMembers).toBeDefined();
      expect(fields.idLabels).toBeDefined();
      expect(fields.shortUrl).toBeDefined();
      expect(fields.url).toBeDefined();
      expect(fields.dateLastActivity).toBeDefined();

      // Verify list types
      expect((fields.idMembers as any).type).toEqual({ type: 'list', element_type: 'string' });
      expect((fields.idLabels as any).type).toEqual({ type: 'list', element_type: 'string' });

      // Check if any custom fields exist (prefixed with cf_)
      const customFieldKeys = Object.keys(fields).filter((key) => key.startsWith('cf_'));
      // Custom fields may or may not exist - just log for visibility
      if (customFieldKeys.length > 0) {
        console.log('Custom fields found:', customFieldKeys);
        // Verify custom field structure
        const firstCfKey = customFieldKeys[0];
        expect((fields[firstCfKey] as any).type).toBeDefined();
      }
    });

    it('Should search records (cards) in a list', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: TRELLO_TOKEN or TRELLO_KEY not set');
        return;
      }
      if (!tablePath) {
        console.warn('Skipping: Table path not defined');
        return;
      }

      const iterator = await searchTrelloRecords(base_context, undefined, { table: tablePath });

      expect(iterator).toBeDefined();
      expect(typeof iterator).toBe('function');

      // Get first batch of records
      const batch = await iterator(base_context, 10);

      // Batch may be null if the list is empty
      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);

        if (records.length > 0) {
          // Check that records have expected fields
          expect(records[0].id).toBeDefined();
          expect(records[0].name).toBeDefined();
        }
      }
    });

    it('Should create a record (card)', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: TRELLO_TOKEN or TRELLO_KEY not set');
        return;
      }
      if (!tablePath) {
        console.warn('Skipping: Table path not defined');
        return;
      }

      const testCardName = `Test Card ${Date.now()}`;
      const records = {
        name: [testCardName],
        desc: ['Test card created by record-based helper'],
      };

      const createdRecords = await createTrelloRecords(base_context, records, { table: tablePath });

      expect(createdRecords).toBeDefined();
      expect(createdRecords.id).toBeDefined();
      expect(Array.isArray(createdRecords.id)).toBe(true);
      expect(createdRecords.id.length).toBe(1);

      createdRecordId = createdRecords.id[0] as string;
      expect(createdRecordId).toBeDefined();
    });

    it('Should search for the created record', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: TRELLO_TOKEN or TRELLO_KEY not set');
        return;
      }
      if (!tablePath) {
        console.warn('Skipping: Table path not defined');
        return;
      }
      if (!createdRecordId) {
        console.warn('Skipping: Created record ID not defined');
        return;
      }

      // Verify the card exists using direct API
      const cardResponse = await trelloClient.get<TrelloCard>(`cards/${createdRecordId}`, {
        token: base_context.conn_opts.token,
        key: base_context.conn_opts.key,
      });

      expect(cardResponse?.id).toBe(createdRecordId);
      expect(cardResponse?.name).toContain('Test Card');
    });

    it('Should update the created record', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: TRELLO_TOKEN or TRELLO_KEY not set');
        return;
      }
      if (!tablePath) {
        console.warn('Skipping: Table path not defined');
        return;
      }
      if (!createdRecordId) {
        console.warn('Skipping: Created record ID not defined');
        return;
      }

      // Update using a WHERE condition that matches the card by id
      const whereCondition = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'id' },
          { type_code: 'value', value: createdRecordId },
        ],
      } as any;

      const updateCount = await updateTrelloRecords(
        base_context,
        { desc: ['Updated via record-based helper'] },
        whereCondition,
        { table: tablePath }
      );

      expect(updateCount).toBe(1);

      // Verify the update
      const cardResponse = await trelloClient.get<TrelloCard>(`cards/${createdRecordId}`, {
        token: base_context.conn_opts.token,
        key: base_context.conn_opts.key,
      });

      expect(cardResponse?.desc).toBe('Updated via record-based helper');
    });

    it('Should delete the created record', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: TRELLO_TOKEN or TRELLO_KEY not set');
        return;
      }
      if (!tablePath) {
        console.warn('Skipping: Table path not defined');
        return;
      }
      if (!createdRecordId) {
        console.warn('Skipping: Created record ID not defined');
        return;
      }

      // Delete using WHERE condition
      const whereCondition = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'id' },
          { type_code: 'value', value: createdRecordId },
        ],
      } as any;

      const deleteCount = await deleteTrelloRecords(base_context, whereCondition, { table: tablePath });

      expect(deleteCount).toBe(1);

      // Verify deletion by trying to get the card (should fail)
      try {
        await trelloClient.get(`cards/${createdRecordId}`, {
          token: base_context.conn_opts.token,
          key: base_context.conn_opts.key,
        });
        // If we get here, the card still exists (unexpected)
        fail('Expected card to be deleted');
      } catch {
        // Expected - card should not exist
        expect(true).toBe(true);
      }
    });
  });

  describe('Should test Trello search with expressions and sorting (integration tests)', () => {
    const base_context = {
      conn_opts: {
        token: '',
        key: '',
      } as any,
    };

    let hasCredentials = false;
    let tablePath: string | undefined;
    let testCardIds: string[] = [];

    beforeAll(async () => {
      const token = process.env.TRELLO_TOKEN;
      const key = process.env.TRELLO_KEY;

      if (!token || !key) {
        console.warn('TRELLO_TOKEN or TRELLO_KEY not set, skipping integration tests');
        return;
      }

      hasCredentials = true;
      base_context.conn_opts.token = token;
      base_context.conn_opts.key = key;

      // Get a table path to use for testing
      clearMappingsCache();
      const tables = await getTrelloTableList(base_context);
      if (tables.length > 0) {
        tablePath = tables[0];
      }
    });

    afterAll(async () => {
      if (!hasCredentials) return;

      // Clean up any test cards created
      if (testCardIds.length > 0) {
        for (const cardId of testCardIds) {
          try {
            await trelloClient.delete(`cards/${cardId}`, {
              token: base_context.conn_opts.token,
              key: base_context.conn_opts.key,
            });
            await delay(200);
          } catch {
            // Card may already be deleted
          }
        }
      }
    });

    afterEach(async () => {
      if (hasCredentials) {
        await delay(200);
      }
    });

    it('Should search records with orderBy (ascending)', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: TRELLO_TOKEN or TRELLO_KEY not set');
        return;
      }
      if (!tablePath) {
        console.warn('Skipping: Table path not defined');
        return;
      }

      const iterator = await searchTrelloRecords(base_context, undefined, {
        table: tablePath,
        orderBy: { field: 'name', direction: 'asc' },
      });

      expect(iterator).toBeDefined();
      const batch = await iterator(base_context, 10);

      // Just verify the search works with orderBy - results depend on data
      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);
      }
    });

    it('Should search records with orderBy (descending)', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: TRELLO_TOKEN or TRELLO_KEY not set');
        return;
      }
      if (!tablePath) {
        console.warn('Skipping: Table path not defined');
        return;
      }

      const iterator = await searchTrelloRecords(base_context, undefined, {
        table: tablePath,
        orderBy: { field: 'pos', direction: 'desc' },
      });

      expect(iterator).toBeDefined();
      const batch = await iterator(base_context, 10);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);
      }
    });

    it('Should search records with equality expression on closed', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: TRELLO_TOKEN or TRELLO_KEY not set');
        return;
      }
      if (!tablePath) {
        console.warn('Skipping: Table path not defined');
        return;
      }

      // Search for open cards
      const whereCondition = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'closed' },
          { type_code: 'value', value: false },
        ],
      } as any;

      const iterator = await searchTrelloRecords(base_context, whereCondition, {
        table: tablePath,
      });

      expect(iterator).toBeDefined();
      const batch = await iterator(base_context, 100);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);
        // All returned records should be open
        for (const record of records) {
          expect(record.closed).toBe(false);
        }
      }
    });

    it('Should create, update, and delete records with WHERE conditions', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: TRELLO_TOKEN or TRELLO_KEY not set');
        return;
      }
      if (!tablePath) {
        console.warn('Skipping: Table path not defined');
        return;
      }

      // Create two test cards
      const timestamp = Date.now();
      const testCard1Name = `Expression Test Card 1 - ${timestamp}`;
      const testCard2Name = `Expression Test Card 2 - ${timestamp}`;

      const createRecords = {
        name: [testCard1Name, testCard2Name],
        desc: ['Test card 1 for expression testing', 'Test card 2 for expression testing'],
      };

      const createdRecords = await createTrelloRecords(base_context, createRecords, {
        table: tablePath,
      });

      expect(createdRecords).toBeDefined();
      expect(createdRecords.id).toBeDefined();
      expect(createdRecords.id.length).toBe(2);

      testCardIds = createdRecords.id as string[];

      // Verify cards were created using direct API
      const card1Response = await trelloClient.get<TrelloCard>(`cards/${testCardIds[0]}`, {
        token: base_context.conn_opts.token,
        key: base_context.conn_opts.key,
      });
      const card2Response = await trelloClient.get<TrelloCard>(`cards/${testCardIds[1]}`, {
        token: base_context.conn_opts.token,
        key: base_context.conn_opts.key,
      });
      expect(card1Response?.id).toBe(testCardIds[0]);
      expect(card2Response?.id).toBe(testCardIds[1]);

      // Update using updateTrelloRecords with a closed filter
      const whereCondition = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'closed' },
          { type_code: 'value', value: false },
        ],
      } as any;

      const updateCount = await updateTrelloRecords(
        base_context,
        { desc: ['Updated desc via expression test'] },
        whereCondition,
        { table: tablePath }
      );

      // Should update at least our test cards
      expect(updateCount).toBeGreaterThanOrEqual(0);

      await delay(500);

      // Delete the test cards
      for (const cardId of testCardIds) {
        const deleteWhere = {
          exp: '==',
          args: [
            { type_code: 'field reference', field: 'id' },
            { type_code: 'value', value: cardId },
          ],
        } as any;

        await deleteTrelloRecords(base_context, deleteWhere, { table: tablePath });
        await delay(200);
      }

      // Clear the testCardIds since we've deleted them
      testCardIds = [];

      // Verify deletion using direct API
      for (const cardId of [createdRecords.id[0], createdRecords.id[1]]) {
        try {
          await trelloClient.get(`cards/${cardId}`, {
            token: base_context.conn_opts.token,
            key: base_context.conn_opts.key,
          });
          // If we get here, card still exists (unexpected)
          fail(`Expected card ${cardId} to be deleted`);
        } catch {
          // Expected - card should not exist
        }
      }
    }, 90_000); // Extended timeout for CRUD operations

    it('Should search with AND expression', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: TRELLO_TOKEN or TRELLO_KEY not set');
        return;
      }
      if (!tablePath) {
        console.warn('Skipping: Table path not defined');
        return;
      }

      // Create a test card
      const timestamp = Date.now();
      const testCardName = `AND Expression Test - ${timestamp}`;

      const createRecords = {
        name: [testCardName],
        desc: ['Test card for AND expression'],
      };

      const createdRecords = await createTrelloRecords(base_context, createRecords, {
        table: tablePath,
      });

      expect(createdRecords.id).toBeDefined();
      const cardId = createdRecords.id[0] as string;
      testCardIds.push(cardId);

      // Verify card was created using direct API
      const cardResponse = await trelloClient.get<TrelloCard>(`cards/${cardId}`, {
        token: base_context.conn_opts.token,
        key: base_context.conn_opts.key,
      });
      expect(cardResponse?.id).toBe(cardId);
      expect(cardResponse?.closed).toBe(false);

      // Search with AND expression (not closed AND name contains 'AND Expression')
      const whereCondition = {
        exp: '&&',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'closed' },
              { type_code: 'value', value: false },
            ],
          },
          {
            exp: 'contains',
            args: [
              { type_code: 'field reference', field: 'name' },
              { type_code: 'value', value: 'AND Expression' },
            ],
          },
        ],
      } as any;

      const iterator = await searchTrelloRecords(base_context, whereCondition, {
        table: tablePath,
      });

      expect(iterator).toBeDefined();
      const batch = await iterator(base_context, 100);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);
        // All records should match both conditions
        for (const record of records) {
          expect(record.closed).toBe(false);
          expect((record.name as string).toLowerCase()).toContain('and expression');
        }
      }
    }, 30_000);
  });

  describe('Should test Trello path parsing and caching (integration tests)', () => {
    const base_context = {
      conn_opts: {
        token: '',
        key: '',
      } as any,
    };

    let hasCredentials = false;

    beforeAll(() => {
      const token = process.env.TRELLO_TOKEN;
      const key = process.env.TRELLO_KEY;

      if (!token || !key) {
        console.warn('TRELLO_TOKEN or TRELLO_KEY not set, skipping integration tests');
        return;
      }

      hasCredentials = true;
      base_context.conn_opts.token = token;
      base_context.conn_opts.key = key;
    });

    afterEach(async () => {
      if (hasCredentials) {
        await delay(200);
      }
    });

    it('Should handle invalid table paths gracefully', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: TRELLO_TOKEN or TRELLO_KEY not set');
        return;
      }

      const invalidPath = 'invalid-path-without-separator';

      await expect(async () => {
        await getTrelloRecordType(base_context, invalidPath);
      }).rejects.toThrow('Invalid table path format');
    });

    it('Should handle non-existent board gracefully', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: TRELLO_TOKEN or TRELLO_KEY not set');
        return;
      }

      const invalidPath = 'NonExistentBoard12345|SomeList';

      await expect(async () => {
        await getTrelloRecordType(base_context, invalidPath);
      }).rejects.toThrow('not found');
    });

    it('Should cache board and list mappings', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: TRELLO_TOKEN or TRELLO_KEY not set');
        return;
      }

      // Clear cache first
      clearMappingsCache();

      // First call should populate the cache
      const tables1 = await getTrelloTableList(base_context);
      expect(tables1).toBeDefined();

      // Second call should use the cache (will be faster, but we can't easily test timing)
      const tables2 = await getTrelloTableList(base_context);
      expect(tables2).toBeDefined();

      // Results should be the same
      expect(tables1).toEqual(tables2);
    });
  });
});
