import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_SQS_APP_NAME, AmazonSQSError } from '../constants';
import { buildMessageAttributes, createSQSClient, formatMessageSize } from '../helpers/constants';
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
  message_body: {
    required: true,
    type: 'string',
  },
  delay_seconds: {
    required: false,
    type: 'integer',
    default_value: 0,
  },
  message_attributes: {
    required: false,
    type: 'hash',
  },
  message_group_id: {
    required: false,
    type: 'string',
  },
  message_deduplication_id: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const createMessage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_SQS_APP_NAME,
  action: 'create_message',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, queue_url, message_body } =
      getQoreContextRequiredValues({
        context: { ...context, opts: obj },
        connectionFields: ['access_key_id', 'secret_access_key'],
        optionFields: ['queue_url', 'message_body'],
        ErrorClass: AmazonSQSError,
      });

    const { delay_seconds, message_attributes, message_group_id, message_deduplication_id } =
      obj || {};
    const region = obj?.region || context?.conn_opts?.region;

    try {
      const sqsClient = createSQSClient({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const sendMessageParams: any = {
        QueueUrl: queue_url,
        MessageBody: message_body,
        ...(delay_seconds && { DelaySeconds: delay_seconds }),
        ...(message_attributes && {
          MessageAttributes: buildMessageAttributes(message_attributes),
        }),
        ...(message_group_id && { MessageGroupId: message_group_id }),
        ...(message_deduplication_id && { MessageDeduplicationId: message_deduplication_id }),
      };

      const command = new SendMessageCommand(sendMessageParams);
      const response = await sqsClient.send(command);

      const messageSize = Buffer.byteLength(message_body, 'utf8');

      return {
        message_id: response.MessageId || '',
        md5_of_body: response.MD5OfMessageBody || '',
        md5_of_message_attributes: response.MD5OfMessageAttributes || '',
        sequence_number: response.SequenceNumber || '',
        queue_url,
        message_body,
        message_size: messageSize,
        formatted_message_size: formatMessageSize(messageSize),
        delay_seconds: delay_seconds || 0,
        message_attributes: message_attributes || {},
        message_group_id: message_group_id || '',
        message_deduplication_id: message_deduplication_id || '',
        sent_at: new Date().toISOString(),
        success: true,
      };
    } catch (error) {
      throw new AmazonSQSError(`Failed to create message: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      message_id: { type: 'string' },
      md5_of_body: { type: 'string' },
      md5_of_message_attributes: { type: 'string' },
      sequence_number: { type: 'string' },
      queue_url: { type: 'string' },
      message_body: { type: 'string' },
      message_size: { type: 'integer' },
      formatted_message_size: { type: 'string' },
      delay_seconds: { type: 'integer' },
      message_attributes: {
        type: {
          type: 'hash',
        },
      },
      message_group_id: { type: 'string' },
      message_deduplication_id: { type: 'string' },
      sent_at: { type: 'string' },
      success: { type: 'boolean' },
    },
  },
});

export default createMessage;
