import { configDotenv } from 'dotenv';
import { getBusinessCentralObjectAllowedValues } from '../apps/business-central/helpers/get-object-allowed-values';
import {
  BusinessCentralNewRecordTrigger,
  BusinessCentralUpdatedRecordTrigger,
} from '../apps/business-central/triggers';

configDotenv({ path: '.env' });

describe('Test Business Central Actions', () => {
  const base_context = {
    conn_opts: {
      token: '',
      instance_type: 'production',
    } as any,
    opts: {
      object: 'companies',
    } as any,
  };

  const refreshToken = process.env.BUSINESS_CENTRAL_REFRESH_TOKEN;
  const clientId = process.env.BUSINESS_CENTRAL_CLIENT_ID;
  const clientSecret = process.env.BUSINESS_CENTRAL_CLIENT_SECRET;

  beforeAll(async () => {
    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error('Microsoft Business Central credentials are not provided');
    }

    const data: {
      client_id: string;
      client_secret: string;
      refresh_token: string;
      grant_type: string;
    } = {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    };

    const formBody = Object.keys(data)
      .map(
        (key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key as keyof typeof data])
      )
      .join('&');

    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
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

    base_context.conn_opts.token = responseData.access_token;
  });

  describe('Should test Business Central allowed values', () => {
    it('Should get object allowed values', async () => {
      const allowed_values = await getBusinessCentralObjectAllowedValues(base_context);
      expect(allowed_values).toBeDefined();
      expect(Array.isArray(allowed_values)).toBe(true);
      expect(allowed_values.length).toBeGreaterThan(0);
    });
  });

  describe('Should test Business Central triggers event example data', () => {
    it('Should get example event data for new record', async () => {
      const trigger = BusinessCentralNewRecordTrigger;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data(base_context);
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it('Should get example event data for updated record trigger', async () => {
      const trigger = BusinessCentralUpdatedRecordTrigger;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data(base_context);
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });
});
