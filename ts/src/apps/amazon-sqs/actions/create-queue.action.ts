import { CreateQueueCommand } from '@aws-sdk/client-sqs';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_SQS_APP_NAME, AmazonSQSError } from '../constants';
import { createSQSClient, extractQueueNameFromUrl } from '../helpers/constants';

const options = {
  region: {
    required: false,
    preselected: true,
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAWSRegionAllowedValues,
  },
  queue_name: {
    required: true,
    type: 'string',
  },
  fifo_queue: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
  content_based_deduplication: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
  visibility_timeout: {
    required: false,
    type: 'integer',
    default_value: 30,
  },
  message_retention_period: {
    required: false,
    type: 'integer',
    default_value: 345600, // 4 days
  },
  delay_seconds: {
    required: false,
    type: 'integer',
    default_value: 0,
  },
  receive_message_wait_time_seconds: {
    required: false,
    type: 'integer',
    default_value: 0,
  },
  max_receive_count: {
    required: false,
    type: 'integer',
    default_value: 3,
  },
  dead_letter_queue_url: {
    required: false,
    type: 'string',
  },
  kms_master_key_id: {
    required: false,
    type: 'string',
  },
  kms_data_key_reuse_period_seconds: {
    required: false,
    type: 'integer',
    default_value: 300,
  },
} satisfies TQoreOptions;

const createQueue = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_SQS_APP_NAME,
  action: 'create_queue',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, queue_name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['queue_name'],
      ErrorClass: AmazonSQSError,
    });

    const {
      fifo_queue,
      content_based_deduplication,
      visibility_timeout,
      message_retention_period,
      delay_seconds,
      receive_message_wait_time_seconds,
      max_receive_count,
      dead_letter_queue_url,
      kms_master_key_id,
      kms_data_key_reuse_period_seconds,
    } = obj || {};

    const region = obj?.region || context?.conn_opts?.region;

    if (fifo_queue && !queue_name.endsWith('.fifo')) {
      throw new AmazonSQSError('FIFO queue names must end with .fifo');
    }

    try {
      const sqsClient = createSQSClient({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const attributes: Record<string, string> = {
        VisibilityTimeout: (visibility_timeout || 30).toString(),
        MessageRetentionPeriod: (message_retention_period || 345600).toString(),
        DelaySeconds: (delay_seconds || 0).toString(),
        ReceiveMessageWaitTimeSeconds: (receive_message_wait_time_seconds || 0).toString(),
      };

      if (fifo_queue) {
        attributes.FifoQueue = 'true';
        if (content_based_deduplication) {
          attributes.ContentBasedDeduplication = 'true';
        }
      }

      if (dead_letter_queue_url && max_receive_count) {
        const redrivePolicy = {
          deadLetterTargetArn: `arn:aws:sqs:${region}:*:${extractQueueNameFromUrl(dead_letter_queue_url)}`,
          maxReceiveCount: max_receive_count,
        };
        attributes.RedrivePolicy = JSON.stringify(redrivePolicy);
      }

      if (kms_master_key_id) {
        attributes.KmsMasterKeyId = kms_master_key_id;
        if (kms_data_key_reuse_period_seconds) {
          attributes.KmsDataKeyReusePeriodSeconds = kms_data_key_reuse_period_seconds.toString();
        }
      }

      const command = new CreateQueueCommand({
        QueueName: queue_name,
        Attributes: attributes,
      });

      const response = await sqsClient.send(command);

      return {
        queue_url: response.QueueUrl || '',
        queue_name,
        region: region || 'us-east-1',
        fifo_queue: fifo_queue || false,
        content_based_deduplication: content_based_deduplication || false,
        visibility_timeout: visibility_timeout || 30,
        message_retention_period: message_retention_period || 345600,
        delay_seconds: delay_seconds || 0,
        receive_message_wait_time_seconds: receive_message_wait_time_seconds || 0,
        max_receive_count: max_receive_count || 3,
        dead_letter_queue_url: dead_letter_queue_url || '',
        kms_master_key_id: kms_master_key_id || '',
        kms_data_key_reuse_period_seconds: kms_data_key_reuse_period_seconds || 300,
        created_at: new Date().toISOString(),
        success: true,
      };
    } catch (error) {
      throw new AmazonSQSError(`Failed to create queue: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      queue_url: { type: 'string' },
      queue_name: { type: 'string' },
      region: { type: 'string' },
      fifo_queue: { type: 'boolean' },
      content_based_deduplication: { type: 'boolean' },
      visibility_timeout: { type: 'integer' },
      message_retention_period: { type: 'integer' },
      delay_seconds: { type: 'integer' },
      receive_message_wait_time_seconds: { type: 'integer' },
      max_receive_count: { type: 'integer' },
      dead_letter_queue_url: { type: 'string' },
      kms_master_key_id: { type: 'string' },
      kms_data_key_reuse_period_seconds: { type: 'integer' },
      created_at: { type: 'string' },
      success: { type: 'boolean' },
    },
  },
});

export default createQueue;
