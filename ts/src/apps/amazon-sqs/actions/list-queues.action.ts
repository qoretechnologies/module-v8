import { GetQueueAttributesCommand, ListQueuesCommand } from '@aws-sdk/client-sqs';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_SQS_APP_NAME, AmazonSQSError } from '../constants';
import { createSQSClient, extractQueueNameFromUrl } from '../helpers/constants';
import { Debugger } from '../../../utils/Debugger';

const options = {
  region: {
    required: false,
    preselected: true,
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAWSRegionAllowedValues,
  },
  queue_name_prefix: {
    required: false,
    type: 'string',
  },
  max_results: {
    required: false,
    type: 'integer',
    default_value: 1000,
  },
  include_attributes: {
    required: false,
    type: 'boolean',
    default_value: true,
  },
} satisfies TQoreOptions;

const listQueues = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_SQS_APP_NAME,
  action: 'list_queues',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      ErrorClass: AmazonSQSError,
    });

    const { queue_name_prefix, max_results, include_attributes } = obj || {};
    const region = obj?.region || context?.conn_opts?.region;

    try {
      const sqsClient = createSQSClient({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const listCommand = new ListQueuesCommand({
        ...(queue_name_prefix && { QueueNamePrefix: queue_name_prefix }),
        MaxResults: max_results || 1000,
      });

      const listResponse = await sqsClient.send(listCommand);

      const queues: any[] = [];

      if (listResponse.QueueUrls) {
        for (const queueUrl of listResponse.QueueUrls) {
          const queueName = extractQueueNameFromUrl(queueUrl);
          let queueData: any = {
            queue_url: queueUrl,
            queue_name: queueName,
          };

          if (include_attributes) {
            try {
              const attributesCommand = new GetQueueAttributesCommand({
                QueueUrl: queueUrl,
                AttributeNames: ['All'],
              });

              const attributesResponse = await sqsClient.send(attributesCommand);
              const attributes = attributesResponse.Attributes || {};

              queueData = {
                ...queueData,
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
                approximate_number_of_messages: parseInt(
                  attributes.ApproximateNumberOfMessages || '0'
                ),
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
                kms_data_key_reuse_period_seconds: parseInt(
                  attributes.KmsDataKeyReusePeriodSeconds || '0'
                ),
                deduplication_scope: attributes.DeduplicationScope || '',
                fifo_throughput_limit: attributes.FifoThroughputLimit || '',
              };
            } catch (error) {
              Debugger.log(`Failed to get attributes for queue ${queueUrl}:`, error);
            }
          }

          queues.push(queueData);
        }
      }

      return {
        queue_count: queues.length,
        queue_name_prefix: queue_name_prefix || '',
        region: region || 'us-east-1',
        include_attributes: include_attributes !== false,
        queues,
        retrieved_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new AmazonSQSError(`Failed to list queues: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      queue_count: { type: 'integer' },
      queue_name_prefix: { type: 'string' },
      region: { type: 'string' },
      include_attributes: { type: 'boolean' },
      queues: {
        type: {
          type: 'list',
          element_type: {
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
            },
          },
        },
      },
      retrieved_at: { type: 'string' },
    },
  },
});

export default listQueues;
