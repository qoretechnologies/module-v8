import {
  EQoreRecordBasedAppErrorCodes,
  IQoreTypeObjectNonList,
} from '@qoretechnologies/ts-toolkit';
import { configDotenv } from 'dotenv';
import {
  AddTagsToRecords,
  CreateZohoCrmRecord,
  DeleteZohoCrmRecord,
  GetZohoCrmRecord,
  ListZohoCrmRecords,
  ListZohoCrmTags,
  ListZohoCrmUsers,
  UpdateZohoCrmRecord,
} from '../apps/zohocrm/actions';
import { getZohoCRMModuleFieldAllowedValues } from '../apps/zohocrm/helpers/get-field-allowed-values';
import { getZohoCRMModuleApiNameAllowedValues } from '../apps/zohocrm/helpers/get-module-allowed-values';
import { getZohoCrmModuleFieldsOptions } from '../apps/zohocrm/helpers/get-module-fields';
import { getZohoCrmRecordIdAllowedValues } from '../apps/zohocrm/helpers/get-record-id-allowed-values';
import { getZohoCRMTagsAllowedValues } from '../apps/zohocrm/helpers/get-tag-allowed-values';
import { createZohoCrmRecords } from '../apps/zohocrm/helpers/record-based/create-records';
import { NewZohoCrmRecord } from '../apps/zohocrm/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { upsertZohoCrmRecords } from '../apps/zohocrm/helpers/record-based/upsert-records';
import { searchZohoCrmRecords } from '../apps/zohocrm/helpers/record-based/search-records';
import { updateZohoCrmRecords } from '../apps/zohocrm/helpers/record-based/update-records';
import { deleteZohoCrmRecords } from '../apps/zohocrm/helpers/record-based/delete-records';
configDotenv({ path: '.env' });

describe('Should test Zoho Crm', () => {
  Debugger.level = DebugLevels.Verbose;
  const refreshToken = process.env.ZOHO_CRM_REFRESH_TOKEN;
  const clientId = process.env.ZOHO_CRM_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CRM_CLIENT_SECRET;

  const baseContext = {
    conn_opts: {
      token: '',
      url: 'https://www.zohoapis.eu',
    } as any,
  };

  beforeAll(async () => {
    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error('Zoho CRM credentials are not provided');
    }

    const data = {
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    };

    const formBody = Object.keys(data)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key as keyof typeof data])}`
      )
      .join('&');

    const response = await fetch('https://accounts.zoho.eu/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
    });
    const responseData = await response.json();
    if (!responseData?.access_token) {
      throw new Error('Failed to get access token');
    }

    baseContext.conn_opts.token = responseData.access_token;
  });

  let fields: string[] = [];

  const module: string = 'Leads';
  describe('Should test allowed values', () => {
    it('Should get module allowed values', async () => {
      const allowedValues = await getZohoCRMModuleApiNameAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).toBeDefined();
    });

    it('Should get module options type', async () => {
      const result = (await getZohoCrmModuleFieldsOptions({
        ...baseContext,
        opts: { module },
      })) as IQoreTypeObjectNonList;

      expect(result).toBeDefined();
      expect(result.type).toBe('hash');
      expect(result.fields).toBeDefined();

      fields = Object.keys(result.fields || {});
      expect(fields.length).toBeGreaterThan(0);
    });

    it('Should get module fields allowed values', async () => {
      const allowedValues = await getZohoCRMModuleFieldAllowedValues({
        ...baseContext,
        opts: { module },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0].value).toBeDefined();
    });

    it('Should get record id allowed values', async () => {
      const allowedValues = await getZohoCrmRecordIdAllowedValues({
        ...baseContext,
        opts: { module },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
    });

    it('Should get tag allowed values', async () => {
      const allowedValues = await getZohoCRMTagsAllowedValues({
        ...baseContext,
        opts: { module },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
    });
  });

  describe('Should test actions', () => {
    let recordId: string | undefined;

    it('Should list tags', async () => {
      const action = ListZohoCrmTags;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          module,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('Should create a lead', async () => {
      const action = CreateZohoCrmRecord;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          module,
          properties: {
            Last_Name: 'Doe',
            First_Name: 'John',
          } as any,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();

      recordId = result.id;
    });

    it('Should add tag to the lead', async () => {
      const action = AddTagsToRecords;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!recordId) throw new Error('recordId is not defined');

      const result = await action.api_function(
        {
          module,
          tags: [{ name: 'Created Tag' }] as any,
          records: [recordId] as any,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.success_count).toBe('1');
    });

    it('Should list leads', async () => {
      const action = ListZohoCrmRecords;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          module,
          per_page: 2,
          fields,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.records).toBeDefined();
    });

    it('Should get dynamic response type', async () => {
      const action = ListZohoCrmRecords;

      if (!('get_dynamic_response_type' in action) || !action.get_dynamic_response_type)
        throw new Error('get_dynamic_response_type not found in action');

      const result = await action.get_dynamic_response_type({
        ...baseContext,
        opts: {
          module,
          fields,
        },
      });

      expect(result).toBeDefined();
    });

    it('Should update the lead', async () => {
      const action = UpdateZohoCrmRecord;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!recordId) throw new Error('recordId is not defined');

      const result = await action.api_function(
        {
          module,
          record_id: recordId,
          properties: {
            Last_Name: 'Doe Updated',
          } as any,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(recordId);
    });

    it('Should get the lead', async () => {
      const action = GetZohoCrmRecord;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!recordId) throw new Error('recordId is not defined');

      const result = await action.api_function(
        {
          module,
          record_id: recordId,
        },
        undefined,
        baseContext
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(recordId);
      expect(result.Last_Name).toBe('Doe Updated');
    });

    it('Should delete the lead', async () => {
      const action = DeleteZohoCrmRecord;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!recordId) throw new Error('recordId is not defined');

      await action.api_function(
        {
          module,
          record_id: recordId,
        },
        undefined,
        baseContext
      );
    });

    it('Should list users', async () => {
      const action = ListZohoCrmUsers;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, baseContext);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Should test triggers event example data', () => {
    it('Should get example event data for new record trigger', async () => {
      const trigger = NewZohoCrmRecord;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...baseContext,
        opts: {
          module,
          field_filter: [{ field: 'Lead_Source', value: 'Cold Call' }],
        } as any,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });

  describe('Should test record based helpers', () => {
    it('Should fail with duplicate field error', async () => {
      try {
        await createZohoCrmRecords(
          baseContext,
          {
            Last_Name: ['Smith'],
            Email: ['test@example.com'],
          },
          { table: module }
        );
        fail('Expected error was not thrown');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.errorCode).toBe(EQoreRecordBasedAppErrorCodes.DUPLICATE_RECORD);
      }
    });

    const emails = [
      'brownwill@example.com',
      'robertsarah@example.com',
      'wilsontom@example.com',
      'andersonjane@example.com',
      'davismike@example.com',
      'martinezemily@example.com',
    ];

    it('Should create diverse records successfully', async () => {
      const result = await createZohoCrmRecords(
        baseContext,
        {
          Last_Name: ['Brown', 'Roberts', 'Wilson', 'Anderson', 'Davis', 'Martinez'],
          First_Name: ['Will', 'Sarah', 'Tom', 'Jane', 'Mike', 'Emily'],
          Email: emails,
          Company: [
            'Tech Corp',
            'Digital Solutions',
            'Tech Corp',
            'Innovation Labs',
            'Digital Solutions',
            'Future Systems',
          ],
          Phone: [
            '+1234567890',
            '+1987654321',
            '+1123456789',
            '+1555555555',
            '+1666666666',
            '+1777777777',
          ],
          City: ['New York', 'Los Angeles', 'New York', 'Chicago', 'Los Angeles', 'Boston'],
          State: ['NY', 'CA', 'NY', 'IL', 'CA', 'MA'],
          Rating: ['Hot', 'Warm', 'Hot', 'Cold', 'Warm', 'Hot'],
          Lead_Status: ['Open', 'Contacted', 'Open', 'Qualified', 'Contacted', 'Qualified'],
          Industry: ['Technology', 'Finance', 'Technology', 'Healthcare', 'Finance', 'Technology'],
          Annual_Revenue: [1000000, 500000, 1500000, 750000, 600000, 2000000],
        },
        { table: module }
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(Array.isArray(result.id)).toBe(true);
      expect(result.id.length).toBe(6);
    });

    it('Should upsert records successfully', async () => {
      const result = await upsertZohoCrmRecords(
        baseContext,
        {
          Email: [...emails, 'tocreate@example.com'],
          Phone: [
            '+1234567890',
            '+1987654321',
            '+1123456789',
            '+1555555555',
            '+1666666666',
            '+1777777777',
            '+1098765432',
          ],
          Last_Name: ['Brown', 'Roberts', 'Wilson', 'Anderson', 'Davis', 'Martinez', 'New'],
          Company: [
            'Tech Corp Updated',
            'Digital Solutions',
            'Tech Corp Updated',
            'Innovation Labs',
            'Digital Solutions',
            'Future Systems',
            'Startup Inc',
          ],
        },
        {
          table: module,
          duplicate_check_fields: ['Email'],
        }
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7);
      expect(result).toEqual([
        'updated',
        'updated',
        'updated',
        'updated',
        'updated',
        'updated',
        'inserted',
      ]);
    });

    it('Should search records with simple expression', async () => {
      const getRecordsIterator = await searchZohoCrmRecords(
        baseContext,
        {
          exp: '==',
          args: [{ field: 'Email' }, { value: 'tocreate@example.com' }],
        },
        { table: module }
      );

      const result = await getRecordsIterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(Array.isArray(result!.id)).toBe(true);
      expect(result!.Email).toContain('tocreate@example.com');
    });

    it('Should search records with OR expression', async () => {
      const getRecordsIterator = await searchZohoCrmRecords(
        baseContext,
        {
          exp: '||',
          args: [
            { exp: '==', args: [{ field: 'Email' }, { value: 'tocreate@example.com' }] },
            { exp: '==', args: [{ field: 'Email' }, { value: 'brownwill@example.com' }] },
          ],
        },
        { table: module }
      );

      const result = await getRecordsIterator(baseContext, 10);

      expect(result).toBeDefined();
      expect(Array.isArray(result!.id)).toBe(true);
      expect(result!.Email).toEqual(
        expect.arrayContaining(['tocreate@example.com', 'brownwill@example.com'])
      );
    });

    it('Should search records with AND expression', async () => {
      const getRecordsIterator = await searchZohoCrmRecords(
        baseContext,
        {
          exp: '&&',
          args: [
            { exp: '==', args: [{ field: 'Last_Name' }, { value: 'Brown' }] },
            { exp: '==', args: [{ field: 'First_Name' }, { value: 'Will' }] },
          ],
        },
        { table: module }
      );

      const result = await getRecordsIterator(baseContext, 10);

      expect(result).toBeDefined();
      if (result && result.id.length > 0) {
        result.Last_Name.forEach((name: string) => {
          expect(name).toBe('Brown');
        });
        result.First_Name.forEach((name: string) => {
          expect(name).toBe('Will');
        });
      }
    });

    it('Should search records with comparison operators', async () => {
      const getRecordsIterator = await searchZohoCrmRecords(
        baseContext,
        {
          exp: 'like',
          args: [{ field: 'Email' }, { value: '%@example.com' }],
        },
        { table: module }
      );

      const result = await getRecordsIterator(baseContext, 10);

      expect(result).toBeDefined();
      if (result && result.id.length > 0) {
        result.Email.forEach((email: string) => {
          expect(email).toContain('@example.com');
        });
      }
    });

    it('Should search records with in operator', async () => {
      const getRecordsIterator = await searchZohoCrmRecords(
        baseContext,
        {
          exp: 'in',
          args: [
            { field: 'Email' },
            { value: ['brownwill@example.com', 'robertsarah@example.com'] },
          ],
        },
        { table: module }
      );

      const result = await getRecordsIterator(baseContext, 10);

      expect(result).toBeDefined();
      if (result && result.id.length > 0) {
        expect(result.Email.length).toBe(2);
        result.Email.forEach((email: string) => {
          expect(['brownwill@example.com', 'robertsarah@example.com']).toContain(email);
        });
      }
    });

    it('Should search records with is_not_null operator', async () => {
      const getRecordsIterator = await searchZohoCrmRecords(
        baseContext,
        {
          exp: 'is_not_null',
          args: [{ field: 'Phone' }],
        },
        { table: module }
      );

      const result = await getRecordsIterator(baseContext, 10);

      expect(result).toBeDefined();
      if (result && result.id.length > 0) {
        result.Phone.forEach((phone: string) => {
          expect(phone).toBeTruthy();
        });
      }
    });

    it('Should search with between operator', async () => {
      const getRecordsIterator = await searchZohoCrmRecords(
        baseContext,
        {
          exp: 'between',
          args: [{ field: 'Annual_Revenue' }, { value: 500000 }, { value: 1500000 }],
        },
        { table: module }
      );

      const result = await getRecordsIterator(baseContext, 10);

      expect(result).toBeDefined();
      if (result && result.id.length > 0) {
        result.Annual_Revenue.forEach((revenue: number) => {
          expect(revenue).toBeGreaterThanOrEqual(500000);
          expect(revenue).toBeLessThanOrEqual(1500000);
        });
      }
    });

    it('Should search records with complex nested expression (4 levels)', async () => {
      const getRecordsIterator = await searchZohoCrmRecords(
        baseContext,
        {
          exp: '||',
          args: [
            {
              exp: '&&',
              args: [
                {
                  exp: '||',
                  args: [
                    {
                      exp: '&&',
                      args: [
                        { exp: 'like', args: [{ field: 'Email' }, { value: '%will%' }] },
                        { exp: '==', args: [{ field: 'City' }, { value: 'New York' }] },
                      ],
                    },
                    {
                      exp: '&&',
                      args: [
                        { exp: 'like', args: [{ field: 'Email' }, { value: '%sarah%' }] },
                        { exp: '==', args: [{ field: 'City' }, { value: 'Los Angeles' }] },
                      ],
                    },
                  ],
                },
                { exp: 'is_not_null', args: [{ field: 'Phone' }] },
              ],
            },
            {
              exp: '&&',
              args: [
                {
                  exp: '||',
                  args: [
                    { exp: '==', args: [{ field: 'Company' }, { value: 'Innovation Labs' }] },
                    { exp: '==', args: [{ field: 'Company' }, { value: 'Future Systems' }] },
                  ],
                },
                {
                  exp: '&&',
                  args: [
                    { exp: '!=', args: [{ field: 'Rating' }, { value: 'Cold' }] },
                    {
                      exp: '||',
                      args: [
                        { exp: '>', args: [{ field: 'Annual_Revenue' }, { value: 1500000 }] },
                        { exp: '==', args: [{ field: 'Lead_Status' }, { value: 'Qualified' }] },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        { table: module, orderBy: { column: 'Annual_Revenue', ascending: false } }
      );

      const result = await getRecordsIterator(baseContext, 10);

      expect(result).toBeDefined();
      if (result && result.id.length > 0) {
        for (let i = 0; i < result.id.length; i++) {
          const email = result.Email[i];
          const city = result.City[i];
          const phone = result.Phone[i];
          const company = result.Company[i];
          const rating = result.Rating[i];
          const revenue = result.Annual_Revenue[i];
          const leadStatus = result.Lead_Status[i];

          const matchesFirstBranch =
            ((email.includes('will') && city === 'New York') ||
              (email.includes('sarah') && city === 'Los Angeles')) &&
            phone;

          const matchesSecondBranch =
            ['Innovation Labs', 'Future Systems'].includes(company) &&
            rating !== 'Cold' &&
            (revenue > 1500000 || leadStatus === 'Qualified');

          expect(Boolean(matchesFirstBranch) || Boolean(matchesSecondBranch)).toBe(true);
        }
      }
    });

    it('Should update records with IN operator', async () => {
      const result = await updateZohoCrmRecords(
        baseContext,
        {
          Website: 'https://example123.com',
        },
        {
          exp: 'in',
          args: [
            { field: 'Email' },
            { value: ['brownwill@example.com', 'robertsarah@example.com'] },
          ],
        },
        { table: module }
      );

      expect(result).toBeDefined();
      expect(result).toBe(2);
    });

    it('Should verify updated records', async () => {
      const getRecordsIterator = await searchZohoCrmRecords(
        baseContext,
        {
          exp: '==',
          args: [{ field: 'Website' }, { value: 'https://example123.com' }],
        },
        { table: module }
      );

      const result = await getRecordsIterator(baseContext, 10);

      expect(result).toBeDefined();
      if (result && result.id.length > 0) {
        expect(result.Website.length).toBeGreaterThanOrEqual(2);
        result.Website.forEach((desc: string) => {
          expect(desc).toBe('https://example123.com');
        });
      }
    });

    it('Should delete specific records', async () => {
      const result = await deleteZohoCrmRecords(
        baseContext,
        {
          exp: '==',
          args: [{ field: 'Email' }, { value: 'tocreate@example.com' }],
        },
        { table: module }
      );

      expect(result).toBeDefined();
      expect(result).toBe(1);
    });

    it('Should clean up all test records using IN operator', async () => {
      const result = await deleteZohoCrmRecords(
        baseContext,
        {
          exp: 'in',
          args: [{ field: 'Email' }, { value: emails }],
        },
        { table: module }
      );

      expect(result).toBeGreaterThanOrEqual(6);
    });
  });
});
