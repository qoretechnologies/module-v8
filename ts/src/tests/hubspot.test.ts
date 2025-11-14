import { IQoreTypeObjectNonList } from '@qoretechnologies/ts-toolkit';
import { configDotenv } from 'dotenv';
import { difference } from 'lodash';
import { createHubspotRecords } from '../apps/hubspot/helpers/record-based/create-records';
import { deleteHubspotRecords } from '../apps/hubspot/helpers/record-based/delete-records';
import { getHubspotRecordType } from '../apps/hubspot/helpers/record-based/get-record-type';
import { getHubspotTableList } from '../apps/hubspot/helpers/record-based/get-table-list';
import { searchHubspotRecords } from '../apps/hubspot/helpers/record-based/search-records';
import { updateHubspotRecords } from '../apps/hubspot/helpers/record-based/update-records';
import { upsertHubspotRecords } from '../apps/hubspot/helpers/record-based/upsert-records';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;
configDotenv({ path: '.env' });

describe('Should test Hubspot record based helpers', () => {
  const baseContext = {
    conn_opts: {
      token: '',
    },
  };

  beforeAll(() => {
    const token = process.env.HUBSPOT_TOKEN;

    if (!token) {
      throw new Error('HUBSPOT_TOKEN is not defined in environment variables');
    }

    baseContext.conn_opts.token = token;
  });

  describe('Should test base helpers', () => {
    let tables: string[] | undefined;

    it('Should get table list', async () => {
      const result = await getHubspotTableList(baseContext);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      tables = result;
    });

    it('Should get record type', async () => {
      const premiumTables = ['emails', 'leads'];
      const results = await Promise.all(
        difference(tables || [], premiumTables).map(async (table) => {
          const recordType = await getHubspotRecordType(baseContext, table);
          return [table, recordType] as [string, IQoreTypeObjectNonList];
        })
      );

      results.forEach(([table, recordType]) => {
        if (!recordType.fields || Object.keys(recordType.fields).length === 0) {
          throw new Error(`No fields found for table ${table}`);
        }
      });
    });

    const table = 'contacts';

    it('Should create records', async () => {
      const result = await createHubspotRecords(
        baseContext,
        {
          firstname: ['John', 'Jane'],
          lastname: ['Doe', 'Smith'],
          company: ['Acme Corp', 'Globex Inc'],
          email: ['john.doe@upserttest.com', 'jane.smith@upserttest.com'],
        },
        { table }
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result!.firstname)).toBe(true);
      expect(result!.firstname.length).toBe(2);
    });

    it('Should upsert records (update existing and insert new)', async () => {
      const result = await upsertHubspotRecords(
        baseContext,
        {
          email: [
            'john.doe@upserttest.com',
            'jane.smith@upserttest.com',
            'bob.wilson@upserttest.com',
          ],
          firstname: ['Johnny', 'Jane', 'Bob'],
          lastname: ['Doe', 'Smith-Updated', 'Wilson'],
          company: ['Acme Corp Updated', 'Globex Inc Updated', 'NewCo'],
        },
        {
          table,
          idProperty: 'email',
        }
      );

      expect(result).toBeDefined();
      expect(result.length).toBe(3);
      expect(result.filter((r) => r === 'updated').length).toBe(2);
      expect(result.filter((r) => r === 'inserted').length).toBe(1);
    });

    it('Should verify upserted records', async () => {
      const iterator = await searchHubspotRecords(
        baseContext,
        {
          exp: 'in',
          args: [
            { field: 'email' },
            {
              value: [
                'john.doe@upserttest.com',
                'jane.smith@upserttest.com',
                'bob.wilson@upserttest.com',
              ],
            },
          ],
        },
        { table }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.email.length).toBe(3);

      const johnIndex = result!.email.indexOf('john.doe@upserttest.com');
      expect(result!.firstname[johnIndex]).toBe('Johnny');
      expect(result!.company[johnIndex]).toBe('Acme Corp Updated');

      const janeIndex = result!.email.indexOf('jane.smith@upserttest.com');
      expect(result!.lastname[janeIndex]).toBe('Smith-Updated');
      expect(result!.company[janeIndex]).toBe('Globex Inc Updated');

      const bobIndex = result!.email.indexOf('bob.wilson@upserttest.com');
      expect(result!.firstname[bobIndex]).toBe('Bob');
      expect(result!.lastname[bobIndex]).toBe('Wilson');
      expect(result!.company[bobIndex]).toBe('NewCo');
    });

    const expression = {
      exp: 'in',
      args: [
        { field: 'email' },
        {
          value: ['john.doe@upserttest.com', 'jane.smith@upserttest.com'],
        },
      ],
    };

    it('Should search records', async () => {
      const iterator = await searchHubspotRecords(baseContext, expression, { table });

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(Array.isArray(result!.firstname)).toBe(true);
      expect(result!.firstname.length).toBe(2);
    });

    it('Should update records', async () => {
      const result = await updateHubspotRecords(
        baseContext,
        {
          hs_lead_status: 'OPEN',
        },
        expression,
        { table }
      );

      expect(result).toBe(2);
    });

    it('Should handle pagination with filters', async () => {
      const iterator = await searchHubspotRecords(
        baseContext,
        {
          exp: 'has_property',
          args: [{ field: 'email' }],
        },
        { table }
      );

      const firstPage = await iterator(baseContext, 2);
      expect(firstPage).toBeDefined();
      expect(firstPage!.id.length).toBeLessThanOrEqual(2);

      const secondPage = await iterator(baseContext, 2);
      if (secondPage) {
        expect(secondPage.id.length).toBeGreaterThan(0);
        const firstIds = new Set(firstPage!.id);
        secondPage.id.forEach((id: string) => {
          expect(firstIds.has(id)).toBe(false);
        });
      }
    });

    it('Should combine filters with ordering', async () => {
      const iterator = await searchHubspotRecords(
        baseContext,
        {
          exp: 'has-property',
          args: [{ field: 'email' }],
        },
        {
          table,
          orderBy: {
            column: 'createdate',
            ascending: true,
          },
        }
      );

      const result = await iterator(baseContext, 10);
      expect(result).toBeDefined();

      result!.email.forEach((email: string) => {
        expect(email).toBeTruthy();
      });

      const dates = result!.createdate.map((d: string) => new Date(d).getTime());
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1]);
      }
    });

    it('Should search records with deeply nested expression (4 levels)', async () => {
      const iterator = await searchHubspotRecords(
        baseContext,
        {
          exp: '&&',
          args: [
            {
              exp: '&&',
              args: [
                {
                  exp: '||',
                  args: [
                    {
                      exp: '==',
                      args: [{ field: 'lifecyclestage' }, { value: 'customer' }],
                    },
                    {
                      exp: '==',
                      args: [{ field: 'lifecyclestage' }, { value: 'marketingqualifiedlead' }],
                    },
                  ],
                },
                {
                  exp: '||',
                  args: [
                    {
                      exp: '==',
                      args: [{ field: 'hs_analytics_source' }, { value: 'ORGANIC_SEARCH' }],
                    },
                    {
                      exp: '==',
                      args: [{ field: 'hs_analytics_source' }, { value: 'PAID_SEARCH' }],
                    },
                  ],
                },
              ],
            },
            {
              exp: '||',
              args: [
                {
                  exp: '&&',
                  args: [
                    {
                      exp: '==',
                      args: [{ field: 'state' }, { value: 'CA' }],
                    },
                    {
                      exp: '==',
                      args: [{ field: 'numemployees' }, { value: '100-500' }],
                    },
                  ],
                },
                {
                  exp: '&&',
                  args: [
                    {
                      exp: '==',
                      args: [{ field: 'state' }, { value: 'TX' }],
                    },
                    {
                      exp: '==',
                      args: [{ field: 'numemployees' }, { value: '25-50' }],
                    },
                  ],
                },
              ],
            },
            {
              exp: '>=',
              args: [{ field: 'annualrevenue' }, { value: '1000000' }],
            },
          ],
        },
        { table: 'contacts' }
      );

      const result = await iterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(result!.id.length).toBe(2);

      result!.email.forEach((email: string) => {
        expect(['sarah.johnson@example.com', 'michael.chen@example.com']).toContain(email);
      });

      result!.lifecyclestage.forEach((stage: string) => {
        expect(['customer', 'marketingqualifiedlead']).toContain(stage);
      });

      result!.hs_analytics_source.forEach((source: string) => {
        expect(['ORGANIC_SEARCH', 'PAID_SEARCH']).toContain(source);
      });

      const stateEmployeePairs = result!.state.map((state: string, index: number) => ({
        state,
        employees: result!.numemployees[index],
      }));

      stateEmployeePairs.forEach((pair: { state: string; employees: string }) => {
        const isValidCombination =
          (pair.state === 'CA' && pair.employees === '100-500') ||
          (pair.state === 'TX' && pair.employees === '25-50');
        expect(isValidCombination).toBe(true);
      });

      result!.annualrevenue.forEach((revenue: string) => {
        expect(Number(revenue)).toBeGreaterThanOrEqual(1000000);
      });
    });

    it('Should clean up upsert test records', async () => {
      const result = await deleteHubspotRecords(
        baseContext,
        {
          exp: 'in',
          args: [
            { field: 'email' },
            {
              value: [
                'john.doe@upserttest.com',
                'jane.smith@upserttest.com',
                'bob.wilson@upserttest.com',
              ],
            },
          ],
        },
        { table }
      );

      expect(result).toBe(3);
    });
  });
});
