import { configDotenv } from 'dotenv';
import {
  AddAmazonSNSSubscriber,
  CreateAmazonSNSJsonMessage,
  CreateAmazonSNSMessage,
  CreateAmazonSNSTopic,
  GetAmazonSNSTopic,
  ListAmazonSNSTopics,
} from '../apps/amazon-sns/actions';
import { getAmazonSNSTopicAllowedValues } from '../apps/amazon-sns/helpers/get-topic-allowed-values';
import { NewAmazonSNSTopic } from '../apps/amazon-sns/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { createSNSClient } from '../apps/amazon-sns/helpers/constants';
import { DeleteTopicCommand } from '@aws-sdk/client-sns';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe.skip('Amazon SNS', () => {
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

  let topicArn: string | undefined;
  let testTopicName: string | undefined;
  const region = 'us-east-1';

  describe('Should test allowed values', () => {
    it('Should get topic allowed values', async () => {
      const allowed_values = await getAmazonSNSTopicAllowedValues({
        ...base_context,
        opts: {
          region,
        },
      });

      expect(allowed_values).toBeDefined();
      expect(Array.isArray(allowed_values)).toBe(true);
      expect(allowed_values.length).toBeGreaterThan(0);

      topicArn = allowed_values[0].value;
    });
  });

  describe('Should test actions', () => {
    it('Should create a test topic', async () => {
      const action = CreateAmazonSNSTopic;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      testTopicName = `qorus-test-topic-${Date.now()}`;

      const result = await action.api_function(
        {
          topic_name: testTopicName,
          region,
          display_name: 'Qorus Test Topic',
          fifo_topic: false,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.topic_arn).toBeDefined();
      expect(result.topic_name).toBe(testTopicName);
      expect(result.region).toBe(region);
      expect(result.console_url).toBeDefined();
      expect(result.created_at).toBeDefined();
      expect(result.attributes.display_name).toBe('Qorus Test Topic');

      topicArn = result.topic_arn;
    });

    it('Should list topics', async () => {
      const action = ListAmazonSNSTopics;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          region,
          include_attributes: true,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.topics).toBeDefined();
      expect(Array.isArray(result.topics)).toBe(true);
      expect(result.topic_count).toBeDefined();
      expect(typeof result.topic_count).toBe('number');
      expect(result.region).toBe(region);
      expect(result.retrieved_at).toBeDefined();
    });

    it('Should get topic details if topics exist', async () => {
      const action = GetAmazonSNSTopic;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          topic_arn: topicArn,
          region,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.topic_arn).toBe(topicArn);
      expect(result.region).toBe(region);
      expect(result.console_url).toBeDefined();
      expect(result.attributes).toBeDefined();
      expect(result.subscription_stats).toBeDefined();
      expect(result.is_fifo).toBe(false);
      expect(result.retrieved_at).toBeDefined();
    });

    it('Should add a subscriber to a topic', async () => {
      const action = AddAmazonSNSSubscriber;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          region,
          topic_arn: topicArn,
          protocol: 'https',
          endpoint: 'https://example.com',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.subscription_arn).toBeDefined();
    });

    it('Should create a plain text message if topics exist', async () => {
      const action = CreateAmazonSNSMessage;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const testMessage = 'This is a test message from Qorus SNS integration test';
      const testSubject = 'Qorus Test Message';

      const result = await action.api_function(
        {
          topic_arn: topicArn,
          message: testMessage,
          subject: testSubject,
          region,
          message_attributes: {
            test_attr: 'test_value',
            source: 'qorus_test',
          },
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.message_id).toBeDefined();
      expect(result.topic_arn).toBe(topicArn);
      expect(result.message).toBe(testMessage);
      expect(result.subject).toBe(testSubject);
      expect(result.published_at).toBeDefined();
      expect(result.console_url).toBeDefined();
      expect(result.message_attributes).toEqual({
        test_attr: 'test_value',
        source: 'qorus_test',
      });
    });

    it('Should create a JSON message if topics exist', async () => {
      const action = CreateAmazonSNSJsonMessage;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const testJsonMessage = {
        event: 'test_event',
        data: {
          user_id: 12345,
          action: 'login',
          timestamp: new Date().toISOString(),
        },
        metadata: {
          source: 'qorus_test',
          version: '1.0',
        },
      };

      const result = await action.api_function(
        {
          topic_arn: topicArn,
          json_message: testJsonMessage,
          subject: 'Qorus Test JSON Message',
          region,
          message_attributes: {
            message_type: 'json',
            test_run: 'true',
          },
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.message_id).toBeDefined();
      expect(result.topic_arn).toBe(topicArn);
      expect(result.json_message).toEqual(testJsonMessage);
      expect(result.message_structure).toBe('json');
      expect(result.published_at).toBeDefined();
      expect(result.console_url).toBeDefined();
      expect(result.message_attributes).toEqual({
        message_type: 'json',
        test_run: 'true',
      });
    });
  });

  describe('Should test triggers event example data', () => {
    it('Should get example event data for new topic trigger', async () => {
      const trigger = NewAmazonSNSTopic;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: { region },
      });

      expect(result.topic_arn).toBeDefined();
      expect(result.topic_name).toBeDefined();
      expect(result.region).toBe(region);
      expect(result.console_url).toBeDefined();
      expect(result.attributes).toBeDefined();
    });
  });

  it('should delete the created test topic', async () => {
    const snsClient = createSNSClient({
      ...base_context.conn_opts,
      region,
    });

    if (!topicArn) throw new Error('Test topic arn is not defined');

    const command = new DeleteTopicCommand({
      TopicArn: topicArn,
    });

    await snsClient.send(command);
  });
});
