import { configDotenv } from 'dotenv';
import {
  DescribeAmazonEc2Instances,
  DescribeAmazonEc2Regions,
  RebootAmazonEc2Instance,
  StartAmazonEc2Instance,
} from '../apps/amazon-ec2/actions';
import { getAmazonEc2InstanceIdAllowedValues } from '../apps/amazon-ec2/helpers/get-instance-id-allowed-values';
import { NewAmazonEc2Instance, NewAmazonEc2ScheduledEvent } from '../apps/amazon-ec2/triggers';
import { getAWSRegionAllowedValues } from '../global/helpers/get-amazon-region-allowed-values';
import { Debugger, DebugLevels } from '../utils/Debugger';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe.skip('Amazon EC2', () => {
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

  let instance: string | undefined;
  describe('Should test allowed values', () => {
    it('Should get region allowed values', async () => {
      const allowed_values = await getAWSRegionAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get instance id allowed values', async () => {
      const allowed_values = await getAmazonEc2InstanceIdAllowedValues({
        ...base_context,
        opts: { region: 'eu-north-1' },
      });
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      instance = allowed_values[0].value;
    });
  });

  describe('Should test actions', () => {
    it('Should start an instance', async () => {
      const action = StartAmazonEc2Instance;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!instance) throw new Error('No instance ID available');

      const result = await action.api_function(
        {
          instance_ids: [instance],
          region: 'eu-north-1',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.instance_ids).toContain(instance);
    });

    it('Should reboot the instance', async () => {
      const action = RebootAmazonEc2Instance;

      if (!('api_function' in action)) throw new Error('api_function not found in action');
      if (!instance) throw new Error('No instance ID available');

      const result = await action.api_function(
        {
          instance_ids: [instance],
          region: 'eu-north-1',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.instance_ids).toContain(instance);
    });

    it('Should describe regions', async () => {
      const action = DescribeAmazonEc2Regions;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function({}, undefined, base_context);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it('Should describe instances', async () => {
      const action = DescribeAmazonEc2Instances;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          region: 'eu-north-1',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.instances)).toBeTruthy();
      expect(result.instances.length).toBeGreaterThan(0);
    });
  });

  describe('Should test triggers event example data', () => {
    it('Should get example event data for new instance trigger', async () => {
      const trigger = NewAmazonEc2Instance;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: { region: 'eu-north-1', instance_states: ['pending', 'running'] } as any,
      });

      expect(result).toBeDefined();
      expect(result.instance_id).toBeDefined();
    });

    it('Should get example event data for new scheduled event trigger', async () => {
      const trigger = NewAmazonEc2ScheduledEvent;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: {
          region: 'eu-north-1',
          event_types: ['system-reboot', 'system-maintenance', 'instance-retirement'],
          instance_ids: [instance],
        } as any,
      });

      expect(result).toBeDefined();
    });
  });
});
