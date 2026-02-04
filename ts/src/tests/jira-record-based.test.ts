/**
 * Jira Record-Based Helpers Tests
 *
 * Unit tests for expressions, search options, and JQL building.
 * Integration tests for full CRUD cycle with real Jira API.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { configDotenv } from 'dotenv';
import {
  clearMappingsCache,
  getJiraTableList,
  getJiraRecordType,
  getJiraExpressions,
  JiraSearchOptions,
  buildJqlFromWhere,
  searchJiraRecords,
  createJiraRecords,
  updateJiraRecords,
  deleteJiraRecords,
  JiraRecordError,
  transformIssueToRecord,
  transformRecordToCreatePayload,
  STANDARD_ISSUE_FIELDS,
  JiraIssue,
  JiraField,
} from '../apps/jira/helpers/record-based';
import { mapColumnFormatToObject, delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;

configDotenv({ path: '.env' });

describe('Jira Record-Based', () => {
  // Unit tests that don't require API access
  describe('Should test Jira expressions and search options (unit tests)', () => {
    it('Should return valid expressions configuration', () => {
      const expressions = getJiraExpressions('en');

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
      expect(JiraSearchOptions).toBeDefined();
      expect(JiraSearchOptions.orderBy).toBeDefined();

      const orderByType = JiraSearchOptions.orderBy.type as {
        type: string;
        fields: Record<string, unknown>;
      };
      expect(orderByType.type).toBe('hash');

      const orderByFields = orderByType.fields as Record<string, { allowed_values?: unknown[] }>;
      expect(orderByFields).toBeDefined();
      expect(orderByFields.field).toBeDefined();
      expect(orderByFields.direction).toBeDefined();

      // Check allowed values for field
      expect(orderByFields.field.allowed_values).toBeDefined();
      const allowedFields = (orderByFields.field.allowed_values as { value: string }[]).map(
        (v) => v.value
      );
      expect(allowedFields).toContain('created');
      expect(allowedFields).toContain('updated');
      expect(allowedFields).toContain('priority');
      expect(allowedFields).toContain('status');
      expect(allowedFields).toContain('key');

      // Check allowed values for direction
      expect(orderByFields.direction.allowed_values).toBeDefined();
      const allowedDirections = (
        orderByFields.direction.allowed_values as { value: string }[]
      ).map((v) => v.value);
      expect(allowedDirections).toContain('asc');
      expect(allowedDirections).toContain('desc');
    });
  });

  describe('Should test Jira JQL building (unit tests)', () => {
    it('Should build JQL with project only', () => {
      const jql = buildJqlFromWhere('TEST');
      expect(jql).toBe('project = "TEST"');
    });

    it('Should build JQL with equality expression', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'status' },
          { type_code: 'value', value: 'Done' },
        ],
      } as unknown;

      const jql = buildJqlFromWhere('TEST', where as any);
      expect(jql).toBe('project = "TEST" AND status = "Done"');
    });

    it('Should build JQL with not-equals expression', () => {
      const where = {
        exp: '!=',
        args: [
          { type_code: 'field reference', field: 'assignee' },
          { type_code: 'value', value: null },
        ],
      } as unknown;

      const jql = buildJqlFromWhere('PROJ', where as any);
      // EMPTY is a JQL keyword and should not be quoted
      expect(jql).toBe('project = "PROJ" AND assignee != EMPTY');
    });

    it('Should build JQL with contains expression', () => {
      const where = {
        exp: 'contains',
        args: [
          { type_code: 'field reference', field: 'summary' },
          { type_code: 'value', value: 'bug' },
        ],
      } as unknown;

      const jql = buildJqlFromWhere('TEST', where as any);
      expect(jql).toBe('project = "TEST" AND summary ~ "bug"');
    });

    it('Should build JQL with is-set expression', () => {
      const where = {
        exp: 'is-set',
        args: [{ type_code: 'field reference', field: 'assignee' }],
      } as unknown;

      const jql = buildJqlFromWhere('TEST', where as any);
      expect(jql).toBe('project = "TEST" AND assignee IS NOT EMPTY');
    });

    it('Should build JQL with is-not-set expression', () => {
      const where = {
        exp: 'is-not-set',
        args: [{ type_code: 'field reference', field: 'duedate' }],
      } as unknown;

      const jql = buildJqlFromWhere('TEST', where as any);
      expect(jql).toBe('project = "TEST" AND duedate IS EMPTY');
    });

    it('Should build JQL with greater-than expression', () => {
      const where = {
        exp: '>',
        args: [
          { type_code: 'field reference', field: 'created' },
          { type_code: 'value', value: '2026-01-01' },
        ],
      } as unknown;

      const jql = buildJqlFromWhere('TEST', where as any);
      expect(jql).toBe('project = "TEST" AND created > "2026-01-01"');
    });

    it('Should build JQL with AND expression', () => {
      const where = {
        exp: '&&',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: 'In Progress' },
            ],
          },
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'priority' },
              { type_code: 'value', value: 'High' },
            ],
          },
        ],
      } as unknown;

      const jql = buildJqlFromWhere('TEST', where as any);
      expect(jql).toBe('project = "TEST" AND (status = "In Progress" AND priority = "High")');
    });

    it('Should build JQL with OR expression', () => {
      const where = {
        exp: '||',
        args: [
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: 'Done' },
            ],
          },
          {
            exp: '==',
            args: [
              { type_code: 'field reference', field: 'status' },
              { type_code: 'value', value: 'Closed' },
            ],
          },
        ],
      } as unknown;

      const jql = buildJqlFromWhere('TEST', where as any);
      expect(jql).toBe('project = "TEST" AND (status = "Done" OR status = "Closed")');
    });

    it('Should escape special characters in values', () => {
      const where = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'summary' },
          { type_code: 'value', value: 'test "quoted" value' },
        ],
      } as unknown;

      const jql = buildJqlFromWhere('TEST', where as any);
      expect(jql).toBe('project = "TEST" AND summary = "test \\"quoted\\" value"');
    });
  });

  describe('Should test Jira standard fields (unit tests)', () => {
    it('Should have all standard issue fields defined', () => {
      expect(STANDARD_ISSUE_FIELDS).toBeDefined();

      // Check required fields
      expect(STANDARD_ISSUE_FIELDS.id).toBe('string');
      expect(STANDARD_ISSUE_FIELDS.key).toBe('string');
      expect(STANDARD_ISSUE_FIELDS.summary).toBe('string');
      expect(STANDARD_ISSUE_FIELDS.description).toBe('string');
      expect(STANDARD_ISSUE_FIELDS.status).toBe('string');
      expect(STANDARD_ISSUE_FIELDS.priority).toBe('string');
      expect(STANDARD_ISSUE_FIELDS.issuetype).toBe('string');
      expect(STANDARD_ISSUE_FIELDS.assignee).toBe('string');
      expect(STANDARD_ISSUE_FIELDS.reporter).toBe('string');
      expect(STANDARD_ISSUE_FIELDS.created).toBe('date');
      expect(STANDARD_ISSUE_FIELDS.updated).toBe('date');
      expect(STANDARD_ISSUE_FIELDS.duedate).toBe('date');

      // Check list fields
      expect(STANDARD_ISSUE_FIELDS.labels).toEqual({ type: 'list', element_type: 'string' });
      expect(STANDARD_ISSUE_FIELDS.components).toEqual({ type: 'list', element_type: 'string' });
    });
  });

  describe('Should test Jira record transformations (unit tests)', () => {
    const mockCustomFieldDefs = new Map<string, JiraField>();
    mockCustomFieldDefs.set('Story Points', {
      id: 'customfield_10001',
      key: 'customfield_10001',
      name: 'Story Points',
      custom: true,
      schema: { type: 'number' },
    });
    mockCustomFieldDefs.set('Sprint', {
      id: 'customfield_10002',
      key: 'customfield_10002',
      name: 'Sprint',
      custom: true,
      schema: { type: 'array', items: 'string' },
    });

    it('Should transform issue to record', () => {
      const mockIssue: JiraIssue = {
        id: '10001',
        key: 'TEST-123',
        self: 'https://example.atlassian.net/rest/api/3/issue/10001',
        fields: {
          summary: 'Test Issue',
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Issue description' }],
              },
            ],
          },
          status: { id: '1', name: 'To Do' },
          priority: { id: '2', name: 'High' },
          issuetype: { id: '3', name: 'Bug' },
          assignee: { accountId: 'user123', displayName: 'John Doe' },
          reporter: { accountId: 'user456', displayName: 'Jane Smith' },
          created: '2026-01-15T10:00:00.000Z',
          updated: '2026-01-20T15:30:00.000Z',
          duedate: '2026-02-01',
          resolution: null,
          labels: ['bug', 'critical'],
          components: [{ name: 'Backend' }],
          fixVersions: [{ name: '1.0.0' }],
          versions: [],
          project: { id: 'proj1', key: 'TEST', name: 'Test Project' },
          customfield_10001: 5,
          customfield_10002: ['Sprint 1', 'Sprint 2'],
        },
      };

      const record = transformIssueToRecord(mockIssue, mockCustomFieldDefs);

      // Check standard fields
      expect(record.id).toBe('10001');
      expect(record.key).toBe('TEST-123');
      expect(record.summary).toBe('Test Issue');
      expect(record.description).toBe('Issue description');
      expect(record.status).toBe('To Do');
      expect(record.statusId).toBe('1');
      expect(record.priority).toBe('High');
      expect(record.priorityId).toBe('2');
      expect(record.issuetype).toBe('Bug');
      expect(record.issuetypeId).toBe('3');
      expect(record.assignee).toBe('user123');
      expect(record.assigneeName).toBe('John Doe');
      expect(record.reporter).toBe('user456');
      expect(record.reporterName).toBe('Jane Smith');
      expect(record.created).toBe('2026-01-15T10:00:00.000Z');
      expect(record.updated).toBe('2026-01-20T15:30:00.000Z');
      expect(record.duedate).toBe('2026-02-01');
      expect(record.resolution).toBeNull();
      expect(record.labels).toEqual(['bug', 'critical']);
      expect(record.components).toEqual(['Backend']);
      expect(record.fixVersions).toEqual(['1.0.0']);
      expect(record.project).toBe('TEST');
      expect(record.projectId).toBe('proj1');
      expect(record.projectName).toBe('Test Project');

      // Check custom fields
      expect(record['cf_Story_Points']).toBe(5);
      expect(record['cf_Sprint']).toEqual(['Sprint 1', 'Sprint 2']);
    });

    it('Should transform record to create payload', () => {
      const record = {
        summary: 'New Issue',
        description: 'Issue description',
        issuetype: 'Task',
        priority: 'High',
        assignee: 'user123',
        labels: ['feature'],
        cf_Story_Points: 3,
      };

      const payload = transformRecordToCreatePayload(record, 'TEST', mockCustomFieldDefs);

      expect(payload.fields).toBeDefined();
      const fields = payload.fields as Record<string, unknown>;
      expect(fields.project).toEqual({ key: 'TEST' });
      expect(fields.summary).toBe('New Issue');
      expect(fields.issuetype).toEqual({ name: 'Task' });
      expect(fields.priority).toEqual({ name: 'High' });
      expect(fields.assignee).toEqual({ accountId: 'user123' });
      expect(fields.labels).toEqual(['feature']);
      expect(fields.customfield_10001).toBe(3);

      // Description should be in ADF format
      expect(fields.description).toBeDefined();
      const desc = fields.description as { type: string; version: number; content: unknown[] };
      expect(desc.type).toBe('doc');
      expect(desc.version).toBe(1);
    });

    it('Should set default issue type to Task when not provided', () => {
      const record = {
        summary: 'New Issue without type',
      };

      const payload = transformRecordToCreatePayload(record, 'TEST', new Map());

      const fields = payload.fields as Record<string, unknown>;
      expect(fields.issuetype).toEqual({ name: 'Task' });
    });
  });

  // Integration tests that require API access
  describe('Should test Jira record-based helpers (integration tests)', () => {
    const base_context = {
      conn_opts: {} as Record<string, string>,
    };

    let hasCredentials = false;

    beforeAll(() => {
      const token = process.env.JIRA_TOKEN;
      const username = process.env.JIRA_USERNAME;
      const password = process.env.JIRA_PASSWORD;
      const cloud_id = process.env.JIRA_CLOUD_ID;

      // Need cloud_id and either token OR username+password
      if (!cloud_id || (!token && (!username || !password))) {
        console.warn(
          'JIRA_CLOUD_ID and (JIRA_TOKEN or JIRA_USERNAME+JIRA_PASSWORD) not set, skipping integration tests'
        );
        return;
      }

      hasCredentials = true;
      base_context.conn_opts.cloud_id = cloud_id;

      // Prefer OAuth2 token, fallback to Basic Auth
      if (token) {
        base_context.conn_opts.token = token;
      } else {
        base_context.conn_opts.username = username!;
        base_context.conn_opts.password = password!;
      }
    });

    afterEach(async () => {
      if (hasCredentials) {
        await delay(200);
      }
    });

    let tablePath: string | undefined;
    let createdIssueKey: string | undefined;

    it('Should get table list (project keys)', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: Jira credentials not set');
        return;
      }

      // Clear the mappings cache to ensure fresh data
      clearMappingsCache();

      const tables = await getJiraTableList(base_context);

      console.dir(tables, { depth: null });

      expect(tables).toBeDefined();
      expect(Array.isArray(tables)).toBe(true);
      expect(tables.length).toBeGreaterThan(0);

      // Table paths should be project keys
      const firstTable = tables[0];
      expect(typeof firstTable).toBe('string');
      expect(firstTable.length).toBeGreaterThan(0);

      tablePath = firstTable;
    });

    it('Should get record type for a project', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: Jira credentials not set');
        return;
      }
      if (!tablePath) {
        console.warn('Skipping: Table path not defined');
        return;
      }

      const recordType = await getJiraRecordType(base_context, tablePath);

      expect(recordType).toBeDefined();
      expect(recordType.type).toBe('hash');

      // recordType should be a hash type with fields
      if (recordType.type !== 'hash' || !('fields' in recordType) || !recordType.fields) {
        throw new Error('Record type should be a hash with fields');
      }

      const { fields } = recordType;

      // Check for standard issue fields
      expect(fields.id).toBeDefined();
      expect(fields.key).toBeDefined();
      expect(fields.summary).toBeDefined();
      expect(fields.description).toBeDefined();
      expect(fields.status).toBeDefined();
      expect(fields.priority).toBeDefined();
      expect(fields.issuetype).toBeDefined();
      expect(fields.assignee).toBeDefined();
      expect(fields.created).toBeDefined();
      expect(fields.updated).toBeDefined();

      // Verify field structure has type
      expect((fields.id as { type: string }).type).toBe('string');

      // Check if any custom fields exist (prefixed with cf_)
      const customFieldKeys = Object.keys(fields).filter((key) => key.startsWith('cf_'));
      // Custom fields may or may not exist - just log for visibility
      if (customFieldKeys.length > 0) {
        console.log('Custom fields found:', customFieldKeys);
      }
    });

    it('Should search records (issues) in a project', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: Jira credentials not set');
        return;
      }
      if (!tablePath) {
        console.warn('Skipping: Table path not defined');
        return;
      }

      const iterator = await searchJiraRecords(base_context, undefined, { table: tablePath });

      expect(iterator).toBeDefined();
      expect(typeof iterator).toBe('function');

      // Get first batch of records
      const batch = await iterator(base_context, 10);

      // Batch may be null if the project is empty
      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);

        if (records.length > 0) {
          // Check that records have expected fields
          expect(records[0].id).toBeDefined();
          expect(records[0].key).toBeDefined();
          expect(records[0].summary).toBeDefined();
        }
      }
    });

    it('Should search records with status filter', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: Jira credentials not set');
        return;
      }
      if (!tablePath) {
        console.warn('Skipping: Table path not defined');
        return;
      }

      // Search for issues that are not done
      const whereCondition = {
        exp: '!=',
        args: [
          { type_code: 'field reference', field: 'status' },
          { type_code: 'value', value: 'Done' },
        ],
      } as unknown;

      const iterator = await searchJiraRecords(base_context, whereCondition as any, {
        table: tablePath,
      });

      expect(iterator).toBeDefined();
      const batch = await iterator(base_context, 10);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);
        // All returned records should not have status 'Done'
        for (const record of records) {
          expect(record.status).not.toBe('Done');
        }
      }
    });

    it('Should search records with orderBy', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: Jira credentials not set');
        return;
      }
      if (!tablePath) {
        console.warn('Skipping: Table path not defined');
        return;
      }

      const iterator = await searchJiraRecords(base_context, undefined, {
        table: tablePath,
        orderBy: { field: 'created', direction: 'desc' },
      });

      expect(iterator).toBeDefined();
      const batch = await iterator(base_context, 10);

      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(Array.isArray(records)).toBe(true);

        // Verify ordering (if multiple records)
        if (records.length > 1) {
          const dates = records.map((r) => new Date(r.created as string).getTime());
          for (let i = 1; i < dates.length; i++) {
            expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
          }
        }
      }
    });

    it('Should create an issue', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: Jira credentials not set');
        return;
      }
      if (!tablePath) {
        console.warn('Skipping: Table path not defined');
        return;
      }

      const testIssueSummary = `Test Issue ${Date.now()}`;
      const records = {
        summary: [testIssueSummary],
        description: ['Test issue created by record-based helper'],
        issuetype: ['Task'],
      };

      const createdRecords = await createJiraRecords(base_context, records, { table: tablePath });

      expect(createdRecords).toBeDefined();
      expect(createdRecords.key).toBeDefined();
      expect(Array.isArray(createdRecords.key)).toBe(true);
      expect(createdRecords.key.length).toBe(1);

      createdIssueKey = createdRecords.key[0] as string;
      expect(createdIssueKey).toBeDefined();
      expect(createdIssueKey).toMatch(/^[A-Z]+-\d+$/); // Issue key format
    }, 30_000);

    it('Should search for the created issue', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: Jira credentials not set');
        return;
      }
      if (!tablePath) {
        console.warn('Skipping: Table path not defined');
        return;
      }
      if (!createdIssueKey) {
        console.warn('Skipping: Created issue key not defined');
        return;
      }

      // Wait for Jira's search index to update
      await delay(3000);

      // Search for the created issue by key
      const whereCondition = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'key' },
          { type_code: 'value', value: createdIssueKey },
        ],
      } as unknown;

      const iterator = await searchJiraRecords(base_context, whereCondition as any, {
        table: tablePath,
      });

      const batch = await iterator(base_context, 10);

      expect(batch).not.toBeNull();
      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(records.length).toBe(1);
        expect(records[0].key).toBe(createdIssueKey);
      }
    }, 30_000);

    it('Should update the created issue', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: Jira credentials not set');
        return;
      }
      if (!tablePath) {
        console.warn('Skipping: Table path not defined');
        return;
      }
      if (!createdIssueKey) {
        console.warn('Skipping: Created issue key not defined');
        return;
      }

      // Update using a WHERE condition that matches the issue by key
      const whereCondition = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'key' },
          { type_code: 'value', value: createdIssueKey },
        ],
      } as unknown;

      const updateCount = await updateJiraRecords(
        base_context,
        { description: ['Updated via record-based helper'] },
        whereCondition as any,
        { table: tablePath }
      );

      expect(updateCount).toBe(1);

      // Verify the update by searching
      const iterator = await searchJiraRecords(base_context, whereCondition as any, {
        table: tablePath,
      });

      const batch = await iterator(base_context, 10);

      expect(batch).not.toBeNull();
      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(records.length).toBe(1);
        expect(records[0].description).toBe('Updated via record-based helper');
      }
    }, 30_000);

    it('Should delete the created issue', async () => {
      if (!hasCredentials) {
        console.warn('Skipping: Jira credentials not set');
        return;
      }
      if (!tablePath) {
        console.warn('Skipping: Table path not defined');
        return;
      }
      if (!createdIssueKey) {
        console.warn('Skipping: Created issue key not defined');
        return;
      }

      // Delete using WHERE condition
      const whereCondition = {
        exp: '==',
        args: [
          { type_code: 'field reference', field: 'key' },
          { type_code: 'value', value: createdIssueKey },
        ],
      } as unknown;

      const deleteCount = await deleteJiraRecords(base_context, whereCondition as any, {
        table: tablePath,
      });

      expect(deleteCount).toBe(1);

      // Verify deletion by searching (should return no results)
      const iterator = await searchJiraRecords(base_context, whereCondition as any, {
        table: tablePath,
      });

      const batch = await iterator(base_context, 10);

      // Should be null or empty
      if (batch) {
        const records = mapColumnFormatToObject(batch);
        expect(records.length).toBe(0);
      }
    }, 30_000);
  });

  describe('Should test Jira error handling (unit tests)', () => {
    it('Should throw JiraRecordError on missing table path', async () => {
      const context = {
        conn_opts: {
          token: 'test',
          cloud_id: 'test',
        },
      };

      await expect(async () => {
        await searchJiraRecords(context, undefined, { table: undefined as unknown as string });
      }).rejects.toThrow(JiraRecordError);
    });

    it('Should throw JiraRecordError on missing credentials', async () => {
      const context = {
        conn_opts: {},
      };

      await expect(async () => {
        await getJiraTableList(context);
      }).rejects.toThrow();
    });
  });
});
