import { PublishCommand } from '@aws-sdk/client-sns';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_SNS_APP_NAME, AmazonSNSError, SNS_MESSAGE_BODY_LIMIT } from '../constants';
import {
  createSNSClient,
  formatMessageAttributes,
  parseTopicArnToName,
  validateMessageAttributes,
} from '../helpers/constants';
import { getAmazonSNSTopicAllowedValues } from '../helpers/get-topic-allowed-values';

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
  topic_arn: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAmazonSNSTopicAllowedValues,
    depends_on: ['region'],
  },
  message: {
    required: true,
    type: 'string',
  },
  subject: {
    required: false,
    type: 'string',
  },
  message_attributes: {
    required: false,
    type: 'hash',
  },
  message_deduplication_id: {
    required: false,
    type: 'string',
  },
  message_group_id: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const createMessage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_SNS_APP_NAME,
  action: 'create_message',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, topic_arn, message } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['topic_arn', 'message'],
      ErrorClass: AmazonSNSError,
    });

    const region = obj?.region || context?.conn_opts?.region;
    const { subject, message_attributes, message_deduplication_id, message_group_id } = obj || {};

    try {
      const snsClient = createSNSClient({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      if (message.length > SNS_MESSAGE_BODY_LIMIT) {
        throw new AmazonSNSError(
          `Message body exceeds maximum size of ${SNS_MESSAGE_BODY_LIMIT} bytes`
        );
      }

      if (message_attributes) {
        validateMessageAttributes(message_attributes);
      }

      const publishParams: any = {
        TopicArn: topic_arn,
        Message: message,
        ...(subject && { Subject: subject }),
        ...(message_attributes && {
          MessageAttributes: formatMessageAttributes(message_attributes),
        }),
        ...(message_deduplication_id && { MessageDeduplicationId: message_deduplication_id }),
        ...(message_group_id && { MessageGroupId: message_group_id }),
      };

      const command = new PublishCommand(publishParams);
      const response = await snsClient.send(command);

      return {
        message_id: response.MessageId || '',
        topic_arn,
        topic_name: parseTopicArnToName(topic_arn),
        message: message.length > 500 ? message.substring(0, 500) + '...' : message,
        full_message_length: message.length,
        subject: subject || '',
        message_attributes: message_attributes || {},
        message_deduplication_id: message_deduplication_id || '',
        message_group_id: message_group_id || '',
        sequence_number: response.SequenceNumber || '',
        published_at: new Date().toISOString(),
        region: region || 'us-east-1',
        console_url: `https://console.aws.amazon.com/sns/v3/home?region=${region}#/topic/${topic_arn}`,
      };
    } catch (error) {
      throw new AmazonSNSError(`Failed to create message: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      message_id: { type: 'string' },
      topic_arn: { type: 'string' },
      topic_name: { type: 'string' },
      message: { type: 'string' },
      full_message_length: { type: 'integer' },
      subject: { type: 'string' },
      message_attributes: {
        type: {
          type: 'hash',
        },
      },
      message_deduplication_id: { type: 'string' },
      message_group_id: { type: 'string' },
      sequence_number: { type: 'string' },
      published_at: { type: 'string' },
      region: { type: 'string' },
      console_url: { type: 'string' },
    },
  },
});

export default createMessage;
