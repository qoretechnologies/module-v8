import { DeleteQueueCommand } from '@aws-sdk/client-sqs';
import { configDotenv } from 'dotenv';
import {
  CreateAmazonSQSJSONMessage,
  CreateAmazonSQSMessage,
  CreateAmazonSQSQueue,
  GetAmazonSQSQueue,
  ListAmazonSQSMessages,
  ListAmazonSQSQueues,
} from '../apps/amazon-sqs/actions';
import { createSQSClient } from '../apps/amazon-sqs/helpers/constants';
import { getAmazonSQSQueueAllowedValues } from '../apps/amazon-sqs/helpers/get-queue-allowed-values';
import {
  NewAmazonSQSJSONMessage,
  NewAmazonSQSQueue,
  NewOrUpdatedAmazonSQSMessage,
} from '../apps/amazon-sqs/triggers';
import { Debugger, DebugLevels } from '../utils/Debugger';

configDotenv({ path: '.env' });
Debugger.level = DebugLevels.Verbose;

describe.skip('Amazon SQS', () => {
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

  let queueUrl: string | undefined;
  let testQueueName: string | undefined;
  const region = 'us-east-1';

  describe('Should test allowed values', () => {
    it('Should get queue allowed values', async () => {
      const allowed_values = await getAmazonSQSQueueAllowedValues({
        ...base_context,
        opts: {
          region,
        },
      });

      expect(allowed_values).toBeDefined();
      expect(Array.isArray(allowed_values)).toBe(true);
      expect(allowed_values.length).toBeGreaterThanOrEqual(0);

      queueUrl = allowed_values[0].value;
    });
  });

  describe('Should test actions', () => {
    it('Should create a test queue', async () => {
      const action = CreateAmazonSQSQueue;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      testQueueName = `qorus-test-queue-${Date.now()}`;

      const result = await action.api_function(
        {
          queue_name: testQueueName,
          region,
          visibility_timeout: 30,
          message_retention_period: 345600, // 4 days
          delay_seconds: 0,
          receive_message_wait_time_seconds: 10,
          max_receive_count: 3,
          fifo_queue: false,
          content_based_deduplication: false,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.queue_url).toBeDefined();
      expect(result.queue_name).toBe(testQueueName);
      expect(result.region).toBe(region);
      expect(result.created_at).toBeDefined();
      expect(result.visibility_timeout).toBe(30);
      expect(result.message_retention_period).toBe(345600);
      expect(result.fifo_queue).toBe(false);
      expect(result.success).toBe(true);

      queueUrl = result.queue_url;
    });

    it('Should list queues', async () => {
      const action = ListAmazonSQSQueues;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          region,
          include_attributes: true,
          max_results: 100,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.queues).toBeDefined();
      expect(Array.isArray(result.queues)).toBe(true);
      expect(result.queue_count).toBeDefined();
      expect(typeof result.queue_count).toBe('number');
      expect(result.region).toBe(region);
      expect(result.retrieved_at).toBeDefined();
      expect(result.include_attributes).toBe(true);
    });

    it('Should get queue details if queue exists', async () => {
      const action = GetAmazonSQSQueue;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          queue_url: queueUrl,
          region,
          attribute_names: ['All'],
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.queue_url).toBe(queueUrl);
      expect(result.queue_name).toBeDefined();
      expect(result.queue_arn).toBeDefined();
      expect(result.visibility_timeout).toBeDefined();
      expect(result.message_retention_period).toBeDefined();
      expect(result.approximate_number_of_messages).toBeDefined();
      expect(result.retrieved_at).toBeDefined();
    });

    it('Should create a plain text message if queue exists', async () => {
      const action = CreateAmazonSQSMessage;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const testMessage = 'This is a test message from Qorus SQS integration test';

      const result = await action.api_function(
        {
          queue_url: queueUrl,
          message_body: testMessage,
          region,
          delay_seconds: 0,
          message_attributes: {
            test_attr: 'test_value',
            source: 'qorus_test',
            message_type: 'text',
          },
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.message_id).toBeDefined();
      expect(result.queue_url).toBe(queueUrl);
      expect(result.message_body).toBe(testMessage);
      expect(result.md5_of_body).toBeDefined();
      expect(result.sent_at).toBeDefined();
      expect(result.message_size).toBeGreaterThan(0);
      expect(result.formatted_message_size).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message_attributes).toEqual({
        test_attr: 'test_value',
        source: 'qorus_test',
        message_type: 'text',
      });
    });

    it('Should create a JSON message if queue exists', async () => {
      const action = CreateAmazonSQSJSONMessage;
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
          queue_url: queueUrl,
          message_data: testJsonMessage,
          region,
          delay_seconds: 0,
          message_attributes: {
            message_type: 'json',
            test_run: 'true',
            content_type: 'application/json',
          },
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.message_id).toBeDefined();
      expect(result.queue_url).toBe(queueUrl);
      expect(result.message_data).toEqual(testJsonMessage);
      expect(result.message_body).toBe(JSON.stringify(testJsonMessage));
      expect(result.md5_of_body).toBeDefined();
      expect(result.sent_at).toBeDefined();
      expect(result.message_size).toBeGreaterThan(0);
      expect(result.formatted_message_size).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message_attributes).toEqual({
        message_type: 'json',
        test_run: 'true',
        content_type: 'application/json',
      });
    });

    it('Should list messages from queue if queue exists', async () => {
      const action = ListAmazonSQSMessages;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          queue_url: queueUrl,
          region,
          max_number_of_messages: 10,
          wait_time_seconds: 1,
          message_attribute_names: ['All'],
          attribute_names: ['All'],
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.queue_url).toBe(queueUrl);
      expect(result.message_count).toBeDefined();
      expect(typeof result.message_count).toBe('number');
      expect(result.max_number_of_messages).toBe(10);
      expect(result.wait_time_seconds).toBe(1);
      expect(Array.isArray(result.messages)).toBe(true);
      expect(result.retrieved_at).toBeDefined();

      if (result.messages.length > 0) {
        const message = result.messages[0];
        expect(message.message_id).toBeDefined();
        expect(message.receipt_handle).toBeDefined();
        expect(message.body).toBeDefined();
        expect(message.md5_of_body).toBeDefined();
        expect(message.message_size).toBeDefined();
        expect(message.formatted_message_size).toBeDefined();
        expect(message.sent_timestamp).toBeDefined();
      }
    });
  });

  describe('Should test triggers event example data', () => {
    it('Should get example event data for new message trigger', async () => {
      const trigger = NewOrUpdatedAmazonSQSMessage;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      if (!queueUrl) throw new Error('No queue URL available for testing');

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: {
          region,
          queue_url: queueUrl,
          wait_time_seconds: 1,
          max_messages: 5,
        },
      });

      if (result) {
        expect(result.message_id).toBeDefined();
        expect(result.queue_url).toBe(queueUrl);
        expect(result.body).toBeDefined();
        expect(result.md5_of_body).toBeDefined();
      }
    });

    it('Should get example event data for new JSON message trigger', async () => {
      const trigger = NewAmazonSQSJSONMessage;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      if (!queueUrl) throw new Error('No queue URL available for testing');

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: {
          region,
          queue_url: queueUrl,
          wait_time_seconds: 1,
          max_messages: 5,
        },
      });

      if (result) {
        expect(result.message_id).toBeDefined();
        expect(result.queue_url).toBe(queueUrl);
        expect(result.body).toBeDefined();
        expect(result.parsed_body).toBeDefined();
        expect(result.is_valid_json).toBe(true);
        expect(result.md5_of_body).toBeDefined();
      }
    });

    it('Should get example event data for new queue trigger', async () => {
      const trigger = NewAmazonSQSQueue;

      if (!('get_example_event_data' in trigger) || !trigger.get_example_event_data)
        throw new Error('get_example_event_data not found in trigger');

      const result = await trigger.get_example_event_data({
        ...base_context,
        opts: { region },
      });

      if (result) {
        expect(result.queue_url).toBeDefined();
        expect(result.queue_name).toBeDefined();
        expect(result.queue_arn).toBeDefined();
        expect(result.created_timestamp).toBeDefined();
        expect(result.visibility_timeout).toBeDefined();
        expect(result.message_retention_period).toBeDefined();
      }
    });
  });

  describe('Cleanup', () => {
    it('Should remove the queue', async () => {
      const sqsClient = createSQSClient({
        ...base_context.conn_opts,
        region,
      });

      const command = new DeleteQueueCommand({
        QueueUrl: queueUrl,
      });

      await sqsClient.send(command);
    });
  });
});
