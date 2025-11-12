import { IQoreTypeObjectNonList } from '@qoretechnologies/ts-toolkit';
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
import { Debugger, DebugLevels } from '../utils/Debugger';
import { getZohoCRMTagsAllowedValues } from '../apps/zohocrm/helpers/get-tag-allowed-values';
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
});
