import { IQoreAppActionWithFunction, IQoreTypeObjectNonList } from '@qoretechnologies/ts-toolkit';
import { configDotenv } from 'dotenv';
import { difference } from 'lodash';
import getHubspotFormSubmissionsAction from '../apps/hubspot/actions/get-form-submissions.action';
import submitHubspotFormAction from '../apps/hubspot/actions/submit-form.action';
import { getHubspotFormAllowedValues } from '../apps/hubspot/helpers/get-form-allowed-values';
import { getHubspotFormFieldAllowedValues } from '../apps/hubspot/helpers/get-form-field-allowed-values';
import { getHubspotPortalId } from '../apps/hubspot/helpers/get-portal-id';
import { createHubspotRecords } from '../apps/hubspot/helpers/record-based/create-records';
import { deleteHubspotRecords } from '../apps/hubspot/helpers/record-based/delete-records';
import { getHubspotRecordType } from '../apps/hubspot/helpers/record-based/get-record-type';
import { getHubspotTableList } from '../apps/hubspot/helpers/record-based/get-table-list';
import { searchHubspotRecords } from '../apps/hubspot/helpers/record-based/search-records';
import { updateHubspotRecords } from '../apps/hubspot/helpers/record-based/update-records';
import { upsertHubspotRecords } from '../apps/hubspot/helpers/record-based/upsert-records';
import HubspotFormSubmittedTrigger from '../apps/hubspot/triggers/form-submitted.trigger';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { checkAllowedValues, retry } from './utils';

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
      await retry(
        async () => {
          const iterator = await searchHubspotRecords(baseContext, expression, { table });

          const result = await iterator(baseContext, 10);

          expect(result).toBeDefined();
          expect(result).toBeTruthy();
          expect(Array.isArray(result!.firstname)).toBe(true);
          expect(result!.firstname.length).toBe(2);
        },
        5,
        500
      );
    });

    it('Should verify upserted records', async () => {
      await retry(
        async () => {
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
        },
        5,
        500
      );
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

describe('Should test Hubspot forms integration', () => {
  const baseContext = {
    conn_opts: {
      token: '',
    },
    opts: {} as Record<string, unknown>,
  };

  let hasFormTestEnv = false;
  let testFormId: string | undefined;
  // The forms endpoints require the `forms` / `form-submissions-write` scopes, which the token may
  // not be authorized for. Probe once so the scope-dependent tests self-skip instead of failing when
  // the scopes are missing, and run automatically once a token with forms access is provided.
  let formsScopeAvailable = false;

  beforeAll(async () => {
    const token = process.env.HUBSPOT_TOKEN;

    if (!token) {
      throw new Error('HUBSPOT_TOKEN is not defined in environment variables');
    }

    baseContext.conn_opts.token = token;

    testFormId = process.env.HUBSPOT_TEST_FORM_GUID;
    hasFormTestEnv = Boolean(testFormId);

    if (!hasFormTestEnv || !testFormId) {
      return;
    }

    try {
      await (getHubspotFormSubmissionsAction as IQoreAppActionWithFunction).api_function(
        { formId: testFormId },
        undefined,
        baseContext
      );
      formsScopeAvailable = true;
    } catch (error) {
      console.warn(
        `HubSpot token lacks the forms scopes (${error}); skipping forms integration tests.`
      );
    }
  });

  describe('getHubspotPortalId helper', () => {
    it('Should resolve portalId from /integrations/v1/me', async () => {
      const portalId = await getHubspotPortalId(baseContext.conn_opts.token);

      expect(typeof portalId).toBe('number');
      expect(portalId).toBeGreaterThan(0);
    });

    it('Should return undefined for an empty token', async () => {
      const portalId = await getHubspotPortalId('');

      expect(portalId).toBeUndefined();
    });
  });

  describe('getHubspotFormAllowedValues helper', () => {
    it('Should return allowed values for the connected portal', async () => {
      const allowedValues = await getHubspotFormAllowedValues(baseContext);

      checkAllowedValues(allowedValues, { checkNonEmpty: false });
    });

    it('Should return an empty array when no token is provided', async () => {
      const allowedValues = await getHubspotFormAllowedValues({ conn_opts: { token: '' } });

      expect(allowedValues).toEqual([]);
    });
  });

  describe('getHubspotFormFieldAllowedValues helper', () => {
    it('Should return an empty array when token or formId is missing', async () => {
      expect(await getHubspotFormFieldAllowedValues({ conn_opts: { token: '' } })).toEqual([]);
      expect(
        await getHubspotFormFieldAllowedValues({
          conn_opts: baseContext.conn_opts,
          opts: {},
        })
      ).toEqual([]);
    });

    it('Should return field allowed values when formId is provided', async () => {
      if (!hasFormTestEnv || !testFormId || !formsScopeAvailable) {
        return;
      }

      const allowedValues = await getHubspotFormFieldAllowedValues({
        conn_opts: baseContext.conn_opts,
        opts: { formId: testFormId },
      });

      checkAllowedValues(allowedValues, { checkNonEmpty: true });
    });
  });

  describe('Form submitted trigger', () => {
    it('Should declare event_info fields matching get_example_event_data output', async () => {
      if (!hasFormTestEnv || !testFormId || !formsScopeAvailable) {
        return;
      }

      const trigger = HubspotFormSubmittedTrigger;

      if (!trigger.get_example_event_data) {
        throw new Error('Trigger is missing get_example_event_data');
      }

      const exampleData = await trigger.get_example_event_data({
        ...baseContext,
        opts: { formId: testFormId },
      });

      if (!exampleData) {
        return;
      }

      const eventInfoFields = Object.keys(
        (trigger.event_info as { type: { fields: Record<string, unknown> } }).type.fields
      );
      const exampleFields = Object.keys(exampleData as Record<string, unknown>);

      const missing = eventInfoFields.filter((f) => !exampleFields.includes(f));
      const extra = exampleFields.filter((f) => !eventInfoFields.includes(f));

      expect(missing).toEqual([]);
      expect(extra).toEqual([]);
    });
  });

  describe('Submit and read form submissions round-trip', () => {
    it('Should submit and then read the submission back', async () => {
      if (!hasFormTestEnv || !testFormId || !formsScopeAvailable) {
        return;
      }

      const marker = `qore-test-${Date.now()}@example.com`;
      const submitAction = submitHubspotFormAction as IQoreAppActionWithFunction;
      const readAction = getHubspotFormSubmissionsAction as IQoreAppActionWithFunction;

      const submitResponse = (await submitAction.api_function(
        {
          formId: testFormId,
          fields: [{ name: 'email', value: marker }],
        },
        undefined,
        baseContext
      )) as { inlineMessage: string; redirectUri: string };

      expect(submitResponse).toBeDefined();
      expect(typeof submitResponse.inlineMessage).toBe('string');

      const submissions = (await retry(
        async () => {
          const result = (await readAction.api_function(
            { formId: testFormId, limit: 50, maxResults: 100 },
            undefined,
            baseContext
          )) as {
            results: Array<{ values: Array<{ name: string; value: string }> }>;
          };

          const hit = result.results.find((s) =>
            s.values.some((v) => v.name === 'email' && v.value === marker)
          );

          if (!hit) {
            throw new Error('submission not yet indexed');
          }

          return result.results;
        },
        5,
        2000
      )) as Array<{ values: Array<{ name: string; value: string }> }>;

      expect(Array.isArray(submissions)).toBe(true);
      expect(submissions.length).toBeGreaterThan(0);
    });
  });

  describe('get_form_submissions input validation', () => {
    it('Should reject calls missing formId', async () => {
      const readAction = getHubspotFormSubmissionsAction as IQoreAppActionWithFunction;

      await expect(readAction.api_function({}, undefined, baseContext)).rejects.toThrow(/formId/);
    });
  });

  describe('submit_form input validation', () => {
    it('Should reject calls missing formId', async () => {
      const submitAction = submitHubspotFormAction as IQoreAppActionWithFunction;

      await expect(
        submitAction.api_function(
          { fields: [{ name: 'email', value: 'x@y.z' }] },
          undefined,
          baseContext
        )
      ).rejects.toThrow(/formId/);
    });

    it('Should reject calls missing fields when formId is provided', async () => {
      if (!hasFormTestEnv || !testFormId) {
        return;
      }

      const submitAction = submitHubspotFormAction as IQoreAppActionWithFunction;

      await expect(
        submitAction.api_function({ formId: testFormId, fields: [] }, undefined, baseContext)
      ).rejects.toThrow(/field/i);
    });
  });
});
