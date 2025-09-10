import { ReceiveMessageCommand } from '@aws-sdk/client-sqs';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_SQS_APP_NAME, AmazonSQSError } from '../constants';
import { createSQSClient, formatMessageSize, parseMessageAttributes } from '../helpers/constants';
import { getAmazonSQSQueueAllowedValues } from '../helpers/get-queue-allowed-values';

const options = {
  region: {
    required: false,
    preselected: true,
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAWSRegionAllowedValues,
    on_change: ['refetch'],
  },
  queue_url: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAmazonSQSQueueAllowedValues,
    depends_on: ['region'],
  },
  max_number_of_messages: {
    required: false,
    type: 'integer',
    default_value: 10,
  },
  wait_time_seconds: {
    required: false,
    type: 'integer',
    default_value: 0,
  },
  visibility_timeout: {
    required: false,
    type: 'integer',
  },
  message_attribute_names: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    default_value: ['All'],
  },
  attribute_names: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    default_value: ['All'],
  },
} satisfies TQoreOptions;

const listMessages = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_SQS_APP_NAME,
  action: 'list_messages',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, queue_url } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['queue_url'],
      ErrorClass: AmazonSQSError,
    });

    const {
      max_number_of_messages,
      wait_time_seconds,
      visibility_timeout,
      message_attribute_names,
      attribute_names,
    } = obj || {};
    const region = obj?.region || context?.conn_opts?.region;

    try {
      const sqsClient = createSQSClient({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const receiveParams: any = {
        QueueUrl: queue_url,
        MaxNumberOfMessages: Math.min(max_number_of_messages || 10, 10),
        WaitTimeSeconds: Math.min(wait_time_seconds || 0, 20),
        MessageAttributeNames: message_attribute_names || ['All'],
        AttributeNames: attribute_names || ['All'],
      };

      if (visibility_timeout !== undefined) {
        receiveParams.VisibilityTimeout = visibility_timeout;
      }

      const command = new ReceiveMessageCommand(receiveParams);
      const response = await sqsClient.send(command);

      const messages: any[] = [];

      if (response.Messages) {
        for (const message of response.Messages) {
          const messageSize = Buffer.byteLength(message.Body || '', 'utf8');

          messages.push({
            message_id: message.MessageId || '',
            receipt_handle: message.ReceiptHandle || '',
            body: message.Body || '',
            md5_of_body: message.MD5OfBody || '',
            md5_of_message_attributes: message.MD5OfMessageAttributes || '',
            message_attributes: parseMessageAttributes(message.MessageAttributes || {}),
            attributes: message.Attributes || {},
            message_size: messageSize,
            formatted_message_size: formatMessageSize(messageSize),
            approximate_receive_count: parseInt(message.Attributes?.ApproximateReceiveCount || '0'),
            approximate_first_receive_timestamp: message.Attributes?.ApproximateFirstReceiveTimestamp
              ? new Date(parseInt(message.Attributes.ApproximateFirstReceiveTimestamp) * 1000).toISOString()
              : '',
            sent_timestamp: message.Attributes?.SentTimestamp
              ? new Date(parseInt(message.Attributes.SentTimestamp) * 1000).toISOString()
              : '',
            sender_id: message.Attributes?.SenderId || '',
            sequence_number: message.Attributes?.SequenceNumber || '',
            message_deduplication_id: message.Attributes?.MessageDeduplicationId || '',
            message_group_id: message.Attributes?.MessageGroupId || '',
          });
        }
      }

      return {
        queue_url,
        message_count: messages.length,
        max_number_of_messages: max_number_of_messages || 10,
        wait_time_seconds: wait_time_seconds || 0,
        visibility_timeout: visibility_timeout || undefined,
        messages,
        retrieved_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new AmazonSQSError(`Failed to list messages: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      queue_url: { type: 'string' },
      message_count: { type: 'integer' },
      max_number_of_messages: { type: 'integer' },
      wait_time_seconds: { type: 'integer' },
      visibility_timeout: { type: 'integer' },
      messages: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              message_id: { type: 'string' },
              receipt_handle: { type: 'string' },
              body: { type: 'string' },
              md5_of_body: { type: 'string' },
              md5_of_message_attributes: { type: 'string' },
              message_attributes: {
                type: {
                  type: 'hash',
                },
              },
              attributes: {
                type: {
                  type: 'hash',
                },
              },
              message_size: { type: 'integer' },
              formatted_message_size: { type: 'string' },
              approximate_receive_count: { type: 'integer' },
              approximate_first_receive_timestamp: { type: 'string' },
              sent_timestamp: { type: 'string' },
              sender_id: { type: 'string' },
              sequence_number: { type: 'string' },
              message_deduplication_id: { type: 'string' },
              message_group_id: { type: 'string' },
            },
          },
        },
      },
      retrieved_at: { type: 'string' },
    },
  },
});

export default listMessages;
