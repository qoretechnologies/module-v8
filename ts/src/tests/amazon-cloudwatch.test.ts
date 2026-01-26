import { configDotenv } from 'dotenv';
import {
  DisableAmazonCloudWatchAlarmActions,
  EnableAmazonCloudWatchAlarmActions,
  SetAmazonCloudWatchAlarmState,
  GetAmazonCloudWatchAlarm,
  ListAmazonCloudWatchAlarms,
} from '../apps/amazon-cloudwatch/actions';
import { getAmazonCloudWatchAlarmAllowedValues } from '../apps/amazon-cloudwatch/helpers/get-alarm-allowed-values';
import {
  AmazonCloudWatchAlarmStateChange,
  NewAmazonCloudWatchAlarm,
} from '../apps/amazon-cloudwatch/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe('Amazon CloudWatch', () => {
  const base_context = {
    conn_opts: {} as any,
  };

  beforeAll(() => {
    const accessKey = process.env.AMAZON_ACCESS_KEY_ID;
    const secretKey = process.env.AMAZON_SECRET_ACCESS_KEY;

    if (!accessKey || !secretKey) {
      throw new Error(`
        Please set the AMAZON_ACCESS_KEY_ID and AMAZON_SECRET_ACCESS_KEY environment variables.
      `);
    }

    base_context.conn_opts = {
      access_key_id: accessKey,
      secret_access_key: secretKey,
    };
  });

  let existingAlarmName: string | undefined;
  const region = 'us-east-1';

  describe('Should test allowed values', () => {
    it('Should get alarm allowed values', async () => {
      const allowed_values = await getAmazonCloudWatchAlarmAllowedValues({
        ...base_context,
        opts: {
          region,
        },
      });

      expect(allowed_values).toBeDefined();
      expect(Array.isArray(allowed_values)).toBe(true);
      expect(allowed_values.length).toBeGreaterThan(0);

      existingAlarmName = allowed_values[0].value;
    });
  });

  describe('Should test actions', () => {
    it('Should list alarms', async () => {
      const action = ListAmazonCloudWatchAlarms;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          region,
          max_records: 50,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.alarms).toBeDefined();
      expect(Array.isArray(result.alarms)).toBe(true);
      expect(result.alarm_count).toBeDefined();
      expect(typeof result.alarm_count).toBe('number');
      expect(result.region).toBe(region);
      expect(result.retrieved_at).toBeDefined();
      expect(result.state_summary).toBeDefined();
    });

    it('Should get alarm details if alarms exist', async () => {
      const action = GetAmazonCloudWatchAlarm;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          alarm_name: existingAlarmName,
          region,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.alarm_name).toBe(existingAlarmName);
      expect(result.state_value).toBeDefined();
      expect(result.metric_name).toBeDefined();
      expect(result.namespace).toBeDefined();
      expect(result.threshold).toBeDefined();
      expect(result.comparison_operator).toBeDefined();
      expect(result.console_url).toBeDefined();
      expect(result.retrieved_at).toBeDefined();
    });

    it('Should disable alarm actions', async () => {
      const action = DisableAmazonCloudWatchAlarmActions;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      if (!existingAlarmName) throw new Error('No alarm available for testing');

      const result = await action.api_function(
        {
          region,
          alarm_names: [existingAlarmName],
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.alarm_names).toContain(existingAlarmName);
      expect(result.disabled_count).toBe(1);
      expect(result.console_urls).toBeDefined();
      expect(result.disabled_at).toBeDefined();
      expect(result.message).toBeDefined();
    });

    it('Should enable alarm actions', async () => {
      const action = EnableAmazonCloudWatchAlarmActions;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!existingAlarmName) throw new Error('No alarm available for testing');

      const result = await action.api_function(
        {
          region,
          alarm_names: [existingAlarmName],
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.alarm_names).toContain(existingAlarmName);
      expect(result.enabled_count).toBe(1);
      expect(result.console_urls).toBeDefined();
      expect(result.enabled_at).toBeDefined();
      expect(result.message).toBeDefined();
    });

    it('Should set alarm state', async () => {
      const action = SetAmazonCloudWatchAlarmState;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          region,
          alarm_name: existingAlarmName,
          state_value: 'OK',
          state_reason: 'User Update',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.alarm_name).toBe(existingAlarmName);
      expect(result.state_value).toBe('OK');
      expect(result.state_reason).toBe('User Update');
      expect(result.console_url).toBeDefined();
      expect(result.state_updated_at).toBeDefined();
      expect(result.message).toBeDefined();
    });

    it('Should list alarms with filters', async () => {
      const action = ListAmazonCloudWatchAlarms;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          region,
          state_filter: 'OK',
          max_records: 10,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.alarms).toBeDefined();
      expect(Array.isArray(result.alarms)).toBe(true);
      expect(result.filters).toBeDefined();
      expect(result.filters.state_filter).toBe('OK');

      result.alarms.forEach((alarm: any) => {
        expect(alarm.state_value).toBe('OK');
        expect(alarm.actions_enabled).toBe(true);
      });
    });
  });

  describe('Should test triggers event example data', () => {
    it('Should get example event data for new alarm trigger', async () => {
      const trigger = NewAmazonCloudWatchAlarm;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: { region } as any,
      });

      expect(result.alarm_name).toBeDefined();
      expect(result.state_value).toBeDefined();
      expect(result.metric_name).toBeDefined();
      expect(result.namespace).toBeDefined();
      expect(result.console_url).toBeDefined();
      expect(result.alarm_configuration_updated_timestamp).toBeDefined();
    });

    it('Should get example event data for alarm state change trigger', async () => {
      const trigger = AmazonCloudWatchAlarmStateChange;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: { region } as any,
      });

      expect(result.state_change_key).toBeDefined();
      expect(result.alarm_name).toBeDefined();
      expect(result.current_state).toBeDefined();
      expect(result.state_updated_timestamp).toBeDefined();
      expect(result.console_url).toBeDefined();
    });
  });
});
