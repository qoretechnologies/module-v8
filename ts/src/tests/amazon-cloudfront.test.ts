import { configDotenv } from 'dotenv';
import {
  GetAmazonCloudFrontDistribution,
  InvalidateAmazonCloudFrontItem,
  ListAmazonCloudFrontDistributions,
  ListAmazonCloudFrontInvalidations,
  UpdateAmazonCloudFrontDistributionStatus,
  GetAmazonCloudFrontInvalidation,
} from '../apps/amazon-cloudfront/actions';
import { getAmazonCloudFrontDistributionAllowedValues } from '../apps/amazon-cloudfront/helpers/get-distribution-allowed-values';
import { getAmazonCloudFrontInvalidationAllowedValues } from '../apps/amazon-cloudfront/helpers/get-invalidation-allowed-values';
import {
  NewAmazonCloudFrontDistribution,
  NewAmazonCloudFrontInvalidation,
} from '../apps/amazon-cloudfront/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe.skip('Amazon CloudFront', () => {
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

  let distributionId: string | undefined;
  let invalidationId: string | undefined;

  describe('Should test allowed values', () => {
    it('Should get distribution allowed values', async () => {
      const allowed_values = await getAmazonCloudFrontDistributionAllowedValues({
        ...base_context,
      });

      expect(allowed_values).toBeDefined();
      expect(Array.isArray(allowed_values)).toBe(true);
      expect(allowed_values.length).toBeGreaterThan(0);

      distributionId = allowed_values[0].value;
    });

    it('Should get invalidation allowed values if distributions exist', async () => {
      const allowed_values = await getAmazonCloudFrontInvalidationAllowedValues({
        ...base_context,
        opts: {
          distribution_id: distributionId,
        },
      });

      expect(allowed_values).toBeDefined();
      expect(Array.isArray(allowed_values)).toBe(true);
      expect(allowed_values.length).toBeGreaterThan(0);

      invalidationId = allowed_values[0].value;
    });
  });

  describe('Should test actions', () => {
    it('Should list distributions', async () => {
      const action = ListAmazonCloudFrontDistributions;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          max_items: 10,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.distributions).toBeDefined();
      expect(Array.isArray(result.distributions)).toBe(true);
      expect(result.distribution_count).toBeDefined();
      expect(typeof result.distribution_count).toBe('number');
    });

    it('Should get distribution details if distributions exist', async () => {
      const action = GetAmazonCloudFrontDistribution;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          distribution_id: distributionId,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(distributionId);
      expect(result.domain_name).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.distribution_config).toBeDefined();
    });

    it('Should list invalidations if distributions exist', async () => {
      const action = ListAmazonCloudFrontInvalidations;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          distribution_id: distributionId,
          max_items: 5,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.distribution_id).toBe(distributionId);
      expect(result.invalidations).toBeDefined();
      expect(Array.isArray(result.invalidations)).toBe(true);
      expect(result.invalidation_count).toBeDefined();
    });

    it('Should get invalidation details if distributions and invalidations exist', async () => {
      const action = GetAmazonCloudFrontInvalidation;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          distribution_id: distributionId,
          invalidation_id: invalidationId,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.invalidation_id).toBe(invalidationId);
      expect(result.distribution_id).toBe(distributionId);
      expect(result.status).toBeDefined();
      expect(result.create_time).toBeDefined();
      expect(result.invalidation_batch).toBeDefined();
      expect(result.paths_count).toBeDefined();
      expect(result.invalidation_batch.paths).toBeDefined();
      expect(Array.isArray(result.invalidation_batch.paths.items)).toBe(true);
    });

    it('Should create invalidation if distributions exist', async () => {
      const action = InvalidateAmazonCloudFrontItem;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          distribution_id: distributionId,
          paths: ['/test-path', '/images/*'],
          caller_reference: `test-${Date.now()}`,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.invalidation_id).toBeDefined();
      expect(result.distribution_id).toBe(distributionId);
      expect(result.status).toBeDefined();
      expect(result.paths).toEqual(['/test-path', '/images/*']);
      expect(result.paths_count).toBe(2);
      expect(result.success).toBe(true);
    });

    it('Should update distribution status if distributions exist', async () => {
      const action = UpdateAmazonCloudFrontDistributionStatus;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const getAction = GetAmazonCloudFrontDistribution;
      if (!('api_function' in getAction)) throw new Error('api_function not found in get action');

      const currentDistribution = await getAction.api_function(
        {
          distribution_id: distributionId,
        },
        undefined,
        base_context
      );

      const currentEnabled = currentDistribution.distribution_config.enabled;

      const result = await action.api_function(
        {
          distribution_id: distributionId,
          enabled: currentEnabled,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.distribution_id).toBe(distributionId);
      expect(result.enabled).toBe(currentEnabled);
      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });
  });

  describe('Should test triggers event example data', () => {
    it('Should get example event data for new distribution trigger', async () => {
      const trigger = NewAmazonCloudFrontDistribution;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...base_context,
      });

      expect(result.distribution_id).toBeDefined();
      expect(result.domain_name).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.cloudfront_url).toBeDefined();
    });

    it('Should get example event data for new invalidation trigger', async () => {
      const trigger = NewAmazonCloudFrontInvalidation;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      if (!distributionId)
        throw new Error('No distributionId available for invalidation trigger test');

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: { distribution_id: distributionId },
      });

      expect(result.invalidation_id).toBeDefined();
      expect(result.distribution_id).toBe(distributionId);
      expect(result.status).toBeDefined();
    });
  });
});
