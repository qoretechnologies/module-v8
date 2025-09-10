import { GetQueueAttributesCommand, ListQueuesCommand } from '@aws-sdk/client-sqs';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { Debugger } from '../../../utils/Debugger';
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
} satisfies TQoreOptions;

const AmazonSQSNewQueueTrigger = QoreAppCreator.createLocalizedTrigger({
  app: AMAZON_SQS_APP_NAME,
  action: 'new_queue',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      ErrorClass: AmazonSQSError,
    });

    const region = context?.opts?.region || context?.conn_opts?.region;

    const getItems = () => {
      return fetchLatestQueues({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'amazon_sqs_new_queue',
      uniqueField: 'queue_url',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { access_key_id, secret_access_key, region } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['region'],
      ErrorClass: AmazonSQSError,
    });

    const queues = await fetchLatestQueues({
      access_key_id,
      secret_access_key,
      region: region || 'us-east-1',
    });

    return queues?.length > 0 ? queues[0] : null;
  },
  event_info: {
    desc: 'Amazon SQS New Queue Trigger Event Info',
    type: {
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
});

export default AmazonSQSNewQueueTrigger;

const fetchLatestQueues = async (options: {
  access_key_id: string;
  secret_access_key: string;
  region: string;
}) => {
  const { access_key_id, secret_access_key, region } = options;

  try {
    const sqsClient = createSQSClient({
      access_key_id,
      secret_access_key,
      region,
    });

    const listCommand = new ListQueuesCommand({
      MaxResults: 1000,
    });

    const listResponse = await sqsClient.send(listCommand);

    const queues: any[] = [];

    if (listResponse.QueueUrls) {
      for (const queueUrl of listResponse.QueueUrls) {
        try {
          const attributesCommand = new GetQueueAttributesCommand({
            QueueUrl: queueUrl,
            AttributeNames: ['All'],
          });

          const attributesResponse = await sqsClient.send(attributesCommand);
          const attributes = attributesResponse.Attributes || {};

          const queueName = extractQueueNameFromUrl(queueUrl);

          queues.push({
            queue_url: queueUrl,
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
            kms_data_key_reuse_period_seconds: parseInt(
              attributes.KmsDataKeyReusePeriodSeconds || '0'
            ),
            deduplication_scope: attributes.DeduplicationScope || '',
            fifo_throughput_limit: attributes.FifoThroughputLimit || '',
          });
        } catch (error) {
          Debugger.log(`Failed to get attributes for queue ${queueUrl}:`, error);
        }
      }
    }

    return queues.sort((a, b) => {
      const dateA = new Date(a.created_timestamp || 0);
      const dateB = new Date(b.created_timestamp || 0);

      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    throw new AmazonSQSError(`Failed to fetch latest queues: ${error.message || error}`);
  }
};
