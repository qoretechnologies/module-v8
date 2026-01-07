import { IQoreAppActionWithFunction } from '@qoretechnologies/ts-toolkit';
import { configDotenv } from 'dotenv';
import {
  batchRunReports,
  checkCompatibility,
  getMetadata,
  runRealtimeReport,
  runReport,
} from '../apps/google-analytics/actions';
import { getGoogleAnalyticsPropertyIdAllowedValues } from '../apps/google-analytics/helpers/get-property-id-allowed-values';
import { Debugger, DebugLevels } from '../utils/Debugger';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe('Google Analytics', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(async () => {
    const refreshToken = process.env.GOOGLE_ANALYTICS_REFRESH_TOKEN;
    const clientId = process.env.GOOGLE_ANALYTICS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ANALYTICS_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error(`
        Please set the GOOGLE_ANALYTICS_REFRESH_TOKEN, GOOGLE_ANALYTICS_CLIENT_ID,
        and GOOGLE_ANALYTICS_CLIENT_SECRET environment variables.
      `);
    }

    const data = {
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    };

    const formBody = Object.keys(data)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key as keyof typeof data])}`)
      .join('&');

    const response = await fetch('https://oauth2.googleapis.com/token', {
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

  let propertyId: string | undefined;

  describe('Should test allowed values', () => {
    it('Should get property allowed values', async () => {
      const allowed_values = await getGoogleAnalyticsPropertyIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      // Use property ID from env or first available
      propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID || allowed_values[0].value;
    });
  });

  describe('Should test run-report action', () => {
    it('Should run a basic report with date range', async () => {
      const action = runReport as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          property_id: propertyId,
          date_ranges: [
            {
              start_date: '30daysAgo',
              end_date: 'yesterday',
            },
          ],
          metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.row_count).toBeDefined();
      expect(result.metric_headers).toBeDefined();
      expect(result.metric_headers.length).toBe(2);
    });

    it('Should run a report with dimensions', async () => {
      const action = runReport as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          property_id: propertyId,
          date_ranges: [
            {
              start_date: '7daysAgo',
              end_date: 'yesterday',
            },
          ],
          metrics: [{ name: 'activeUsers' }],
          dimensions: [{ name: 'country' }],
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.dimension_headers).toBeDefined();
      expect(result.dimension_headers.length).toBe(1);
      expect(result.dimension_headers[0].name).toBe('country');
    });

    it('Should run a report with limit and offset', async () => {
      const action = runReport as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          property_id: propertyId,
          date_ranges: [
            {
              start_date: '30daysAgo',
              end_date: 'yesterday',
            },
          ],
          metrics: [{ name: 'activeUsers' }],
          dimensions: [{ name: 'date' }],
          limit: 5,
          offset: 0,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.rows.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Should test run-realtime-report action', () => {
    it('Should get real-time active users', async () => {
      const action = runRealtimeReport as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          property_id: propertyId,
          metrics: [{ name: 'activeUsers' }],
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.metric_headers).toBeDefined();
      expect(result.metric_headers.length).toBe(1);
    });

    it('Should support custom minute ranges', async () => {
      const action = runRealtimeReport as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          property_id: propertyId,
          metrics: [{ name: 'activeUsers' }],
          minute_ranges: [
            {
              name: 'last-5-minutes',
              start_minutes_ago: 4,
              end_minutes_ago: 0,
            },
          ],
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.metric_headers).toBeDefined();
    });
  });

  describe('Should test get-metadata action', () => {
    it('Should retrieve available dimensions and metrics', async () => {
      const action = getMetadata as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          property_id: propertyId,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.dimensions).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.dimension_count).toBeGreaterThan(0);
      expect(result.metric_count).toBeGreaterThan(0);
    });
  });

  describe('Should test batch-run-reports action', () => {
    it('Should run multiple reports', async () => {
      const action = batchRunReports as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          property_id: propertyId,
          requests: [
            {
              date_ranges: [{ start_date: '7daysAgo', end_date: 'yesterday' }],
              metrics: [{ name: 'activeUsers' }],
            },
            {
              date_ranges: [{ start_date: '7daysAgo', end_date: 'yesterday' }],
              metrics: [{ name: 'sessions' }],
              dimensions: [{ name: 'country' }],
            },
          ],
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.reports).toBeDefined();
      expect(result.reports.length).toBe(2);
      expect(result.report_count).toBe(2);
    });
  });

  describe('Should test check-compatibility action', () => {
    it('Should validate compatible combinations', async () => {
      const action = checkCompatibility as IQoreAppActionWithFunction;
      const result = await action.api_function(
        {
          property_id: propertyId,
          dimensions: [{ name: 'country' }, { name: 'city' }],
          metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.dimension_compatibilities).toBeDefined();
      expect(result.metric_compatibilities).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.total_dimensions).toBe(2);
      expect(result.summary.total_metrics).toBe(2);
    });
  });
});
