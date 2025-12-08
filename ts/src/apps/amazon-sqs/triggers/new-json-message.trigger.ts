import { ReceiveMessageCommand } from '@aws-sdk/client-sqs';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_SQS_APP_NAME, AmazonSQSError } from '../constants';
import { createSQSClient, parseMessageAttributes } from '../helpers/constants';
import { getAmazonSQSQueueAllowedValues } from '../helpers/get-queue-allowed-values';
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
  queue_url: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAmazonSQSQueueAllowedValues,
    depends_on: ['region'],
  },
  wait_time_seconds: {
    required: false,
    type: 'integer',
    default_value: 10,
  },
  max_messages: {
    required: false,
    type: 'integer',
    default_value: 10,
  },
} satisfies TQoreOptions;

const AmazonSQSNewJSONMessageTrigger = QoreAppCreator.createLocalizedTrigger({
  app: AMAZON_SQS_APP_NAME,
  action: 'new_json_message',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { access_key_id, secret_access_key, queue_url } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['queue_url'],
      ErrorClass: AmazonSQSError,
    });

    const region = context?.opts?.region || context?.conn_opts?.region;
    const { wait_time_seconds, max_messages } = context?.opts || {};

    const getItems = () => {
      return fetchLatestJSONMessages({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
        queue_url,
        wait_time_seconds: wait_time_seconds || 10,
        max_messages: max_messages || 10,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'amazon_sqs_new_json_message',
      uniqueField: 'message_id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { access_key_id, secret_access_key, queue_url, region } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['queue_url', 'region'],
      ErrorClass: AmazonSQSError,
    });

    const { wait_time_seconds, max_messages } = context?.opts || {};

    const messages = await fetchLatestJSONMessages({
      access_key_id,
      secret_access_key,
      region: region || 'us-east-1',
      queue_url,
      wait_time_seconds: wait_time_seconds || 10,
      max_messages: max_messages || 10,
    });

    return messages?.length > 0 ? messages[0] : null;
  },
  event_info: {
    desc: 'Amazon SQS New JSON Message Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        message_id: { type: 'string' },
        receipt_handle: { type: 'string' },
        body: { type: 'string' },
        parsed_body: {
          type: {
            type: 'hash',
          },
        },
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
        queue_url: { type: 'string' },
        approximate_receive_count: { type: 'integer' },
        approximate_first_receive_timestamp: { type: 'string' },
        sent_timestamp: { type: 'string' },
        sender_id: { type: 'string' },
        is_valid_json: { type: 'bool' },
      },
    },
  },
});

export default AmazonSQSNewJSONMessageTrigger;

const fetchLatestJSONMessages = async (options: {
  access_key_id: string;
  secret_access_key: string;
  region: string;
  queue_url: string;
  wait_time_seconds: number;
  max_messages: number;
}) => {
  const { access_key_id, secret_access_key, region, queue_url, wait_time_seconds, max_messages } =
    options;

  try {
    const sqsClient = createSQSClient({
      access_key_id,
      secret_access_key,
      region,
    });

    const command = new ReceiveMessageCommand({
      QueueUrl: queue_url,
      MaxNumberOfMessages: Math.min(max_messages, 10),
      WaitTimeSeconds: Math.min(wait_time_seconds, 20),
      MessageAttributeNames: ['All'],
      AttributeNames: ['All'],
    });

    const response = await sqsClient.send(command);

    const messages: any[] = [];

    if (response.Messages) {
      for (const message of response.Messages) {
        let parsedBody: any = null;
        let isValidJSON = false;

        try {
          parsedBody = JSON.parse(message.Body || '');
          isValidJSON = true;
        } catch (error) {
          Debugger.log('Message body is not valid JSON:', error);
          continue;
        }

        messages.push({
          message_id: message.MessageId || '',
          receipt_handle: message.ReceiptHandle || '',
          body: message.Body || '',
          parsed_body: parsedBody,
          md5_of_body: message.MD5OfBody || '',
          md5_of_message_attributes: message.MD5OfMessageAttributes || '',
          message_attributes: parseMessageAttributes(message.MessageAttributes || {}),
          attributes: message.Attributes || {},
          queue_url,
          approximate_receive_count: parseInt(message.Attributes?.ApproximateReceiveCount || '0'),
          approximate_first_receive_timestamp: message.Attributes?.ApproximateFirstReceiveTimestamp
            ? new Date(
                parseInt(message.Attributes.ApproximateFirstReceiveTimestamp) * 1000
              ).toISOString()
            : '',
          sent_timestamp: message.Attributes?.SentTimestamp
            ? new Date(parseInt(message.Attributes.SentTimestamp) * 1000).toISOString()
            : '',
          sender_id: message.Attributes?.SenderId || '',
          is_valid_json: isValidJSON,
        });
      }
    }

    return messages;
  } catch (error) {
    throw new AmazonSQSError(`Failed to fetch latest JSON messages: ${error.message || error}`);
  }
};
