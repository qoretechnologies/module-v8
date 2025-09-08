import { CreateTopicCommand } from '@aws-sdk/client-sns';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_SNS_APP_NAME, AmazonSNSError } from '../constants';
import { createSNSClient, parseTopicArnToName } from '../helpers/constants';

const options = {
  topic_name: {
    required: true,
    type: 'string',
  },
  region: {
    required: false,
    preselected: true,
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAWSRegionAllowedValues,
  },
  display_name: {
    required: false,
    type: 'string',
  },
  delivery_policy: {
    required: false,
    type: 'string',
  },
  policy: {
    required: false,
    type: 'string',
  },
  kms_master_key_id: {
    required: false,
    type: 'string',
  },
  fifo_topic: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
  content_based_deduplication: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
} satisfies TQoreOptions;

const createTopic = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_SNS_APP_NAME,
  action: 'create_topic',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, topic_name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['topic_name'],
      ErrorClass: AmazonSNSError,
    });

    const region = obj?.region || context?.conn_opts?.region;
    const {
      display_name,
      delivery_policy,
      policy,
      kms_master_key_id,
      fifo_topic,
      content_based_deduplication,
    } = obj || {};

    try {
      const snsClient = createSNSClient({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      if (fifo_topic && !topic_name.endsWith('.fifo')) {
        throw new AmazonSNSError('FIFO topic names must end with .fifo suffix');
      }

      const attributes: Record<string, string> = {};

      if (display_name) {
        attributes.DisplayName = display_name;
      }

      if (delivery_policy) {
        attributes.DeliveryPolicy = delivery_policy;
      }

      if (policy) {
        attributes.Policy = policy;
      }

      if (kms_master_key_id) {
        attributes.KmsMasterKeyId = kms_master_key_id;
      }

      if (fifo_topic) {
        attributes.FifoTopic = 'true';
      }

      if (content_based_deduplication) {
        attributes.ContentBasedDeduplication = 'true';
      }

      const command = new CreateTopicCommand({
        Name: topic_name,
        ...(Object.keys(attributes).length > 0 && { Attributes: attributes }),
      });

      const response = await snsClient.send(command);

      return {
        topic_arn: response.TopicArn || '',
        topic_name: parseTopicArnToName(response.TopicArn || ''),
        region: region || 'us-east-1',
        console_url: `https://console.aws.amazon.com/sns/v3/home?region=${region}#/topic/${response.TopicArn}`,
        fifo_topic: fifo_topic || false,
        content_based_deduplication: content_based_deduplication || false,
        display_name: display_name || '',
        created_at: new Date().toISOString(),
        attributes: {
          display_name: display_name || '',
          delivery_policy: delivery_policy || '',
          policy: policy || '',
          kms_master_key_id: kms_master_key_id || '',
          fifo_topic: fifo_topic || false,
          content_based_deduplication: content_based_deduplication || false,
        },
      };
    } catch (error) {
      throw new AmazonSNSError(`Failed to create topic: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      topic_arn: { type: 'string' },
      topic_name: { type: 'string' },
      region: { type: 'string' },
      console_url: { type: 'string' },
      fifo_topic: { type: 'boolean' },
      content_based_deduplication: { type: 'boolean' },
      display_name: { type: 'string' },
      created_at: { type: 'string' },
      attributes: {
        type: {
          type: 'hash',
          fields: {
            display_name: { type: 'string' },
            delivery_policy: { type: 'string' },
            policy: { type: 'string' },
            kms_master_key_id: { type: 'string' },
            fifo_topic: { type: 'boolean' },
            content_based_deduplication: { type: 'boolean' },
          },
        },
      },
    },
  },
});

export default createTopic;
