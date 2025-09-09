import { GetQueueAttributesCommand, QueueAttributeName } from '@aws-sdk/client-sqs';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_SQS_APP_NAME, AmazonSQSError } from '../constants';
import { createSQSClient, extractQueueNameFromUrl } from '../helpers/constants';
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
  attribute_names: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    default_value: ['All'],
  },
} satisfies TQoreOptions;

const getQueue = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_SQS_APP_NAME,
  action: 'get_queue',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, queue_url } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['queue_url'],
      ErrorClass: AmazonSQSError,
    });

    const { attribute_names } = obj || {};
    const region = obj?.region || context?.conn_opts?.region;

    try {
      const sqsClient = createSQSClient({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const command = new GetQueueAttributesCommand({
        QueueUrl: queue_url,
        AttributeNames: (attribute_names || ['All']) as QueueAttributeName[],
      });

      const response = await sqsClient.send(command);
      const attributes = response.Attributes || {};

      const queueName = extractQueueNameFromUrl(queue_url);

      return {
        queue_url,
        queue_name: queueName,
        queue_arn: attributes.QueueArn || '',
        created_timestamp: attributes.CreatedTimestamp
          ? new Date(parseInt(attributes.CreatedTimestamp) * 1000).toISOString()
          : '',
        last_modified_timestamp: attributes.LastModifiedTimestamp
          ? new Date(parseInt(attributes.LastModifiedTimestamp) * 1000).toISOString()
          : '',
        visibility_timeout: parseInt(attributes.VisibilityTimeout || '0'),
        message_retention_period: parseInt(attributes.MessageRetentionPeriod || '0'),
        receive_message_wait_time_seconds: parseInt(
          attributes.ReceiveMessageWaitTimeSeconds || '0'
        ),
        delay_seconds: parseInt(attributes.DelaySeconds || '0'),
        approximate_number_of_messages: parseInt(attributes.ApproximateNumberOfMessages || '0'),
        approximate_number_of_messages_not_visible: parseInt(
          attributes.ApproximateNumberOfMessagesNotVisible || '0'
        ),
        approximate_number_of_messages_delayed: parseInt(
          attributes.ApproximateNumberOfMessagesDelayed || '0'
        ),
        policy: attributes.Policy || '',
        redrive_policy: attributes.RedrivePolicy || '',
        fifo_queue: attributes.FifoQueue === 'true',
        content_based_deduplication: attributes.ContentBasedDeduplication === 'true',
        kms_master_key_id: attributes.KmsMasterKeyId || '',
        kms_data_key_reuse_period_seconds: parseInt(attributes.KmsDataKeyReusePeriodSeconds || '0'),
        deduplication_scope: attributes.DeduplicationScope || '',
        fifo_throughput_limit: attributes.FifoThroughputLimit || '',
        retrieved_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new AmazonSQSError(`Failed to get queue: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      queue_url: { type: 'string' },
      queue_name: { type: 'string' },
      queue_arn: { type: 'string' },
      created_timestamp: { type: 'string' },
      last_modified_timestamp: { type: 'string' },
      visibility_timeout: { type: 'integer' },
      message_retention_period: { type: 'integer' },
      receive_message_wait_time_seconds: { type: 'integer' },
      delay_seconds: { type: 'integer' },
      approximate_number_of_messages: { type: 'integer' },
      approximate_number_of_messages_not_visible: { type: 'integer' },
      approximate_number_of_messages_delayed: { type: 'integer' },
      policy: { type: 'string' },
      redrive_policy: { type: 'string' },
      fifo_queue: { type: 'boolean' },
      content_based_deduplication: { type: 'boolean' },
      kms_master_key_id: { type: 'string' },
      kms_data_key_reuse_period_seconds: { type: 'integer' },
      deduplication_scope: { type: 'string' },
      fifo_throughput_limit: { type: 'string' },
      retrieved_at: { type: 'string' },
    },
  },
});

export default getQueue;
