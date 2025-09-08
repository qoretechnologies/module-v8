import { GetTopicAttributesCommand } from '@aws-sdk/client-sns';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_SNS_APP_NAME, AmazonSNSError } from '../constants';
import { createSNSClient, parseTopicArnToName } from '../helpers/constants';
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
} satisfies TQoreOptions;

const getTopic = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_SNS_APP_NAME,
  action: 'get_topic',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, topic_arn } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['topic_arn'],
      ErrorClass: AmazonSNSError,
    });

    const region = obj?.region || context?.conn_opts?.region;

    try {
      const snsClient = createSNSClient({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const command = new GetTopicAttributesCommand({
        TopicArn: topic_arn,
      });

      const response = await snsClient.send(command);

      if (!response.Attributes) {
        throw new AmazonSNSError('No attributes found for the specified topic');
      }

      const attributes = response.Attributes;

      return {
        topic_arn,
        topic_name: parseTopicArnToName(topic_arn),
        region: region || 'us-east-1',
        console_url: `https://console.aws.amazon.com/sns/v3/home?region=${region}#/topic/${topic_arn}`,
        attributes: {
          display_name: attributes.DisplayName || '',
          owner: attributes.Owner || '',
          policy: attributes.Policy || '',
          delivery_policy: attributes.DeliveryPolicy || '',
          effective_delivery_policy: attributes.EffectiveDeliveryPolicy || '',
          subscriptions_confirmed: parseInt(attributes.SubscriptionsConfirmed || '0'),
          subscriptions_pending: parseInt(attributes.SubscriptionsPending || '0'),
          subscriptions_deleted: parseInt(attributes.SubscriptionsDeleted || '0'),
          topic_arn: attributes.TopicArn || '',
          fifo_topic: attributes.FifoTopic === 'true',
          content_based_deduplication: attributes.ContentBasedDeduplication === 'true',
          kms_master_key_id: attributes.KmsMasterKeyId || '',
        },
        subscription_stats: {
          total_subscriptions:
            parseInt(attributes.SubscriptionsConfirmed || '0') +
            parseInt(attributes.SubscriptionsPending || '0'),
          confirmed: parseInt(attributes.SubscriptionsConfirmed || '0'),
          pending: parseInt(attributes.SubscriptionsPending || '0'),
          deleted: parseInt(attributes.SubscriptionsDeleted || '0'),
        },
        is_fifo: attributes.FifoTopic === 'true',
        has_kms_encryption: !!attributes.KmsMasterKeyId,
        retrieved_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new AmazonSNSError(`Failed to get topic: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      topic_arn: { type: 'string' },
      topic_name: { type: 'string' },
      region: { type: 'string' },
      console_url: { type: 'string' },
      attributes: {
        type: {
          type: 'hash',
          fields: {
            display_name: { type: 'string' },
            owner: { type: 'string' },
            policy: { type: 'string' },
            delivery_policy: { type: 'string' },
            effective_delivery_policy: { type: 'string' },
            subscriptions_confirmed: { type: 'integer' },
            subscriptions_pending: { type: 'integer' },
            subscriptions_deleted: { type: 'integer' },
            topic_arn: { type: 'string' },
            fifo_topic: { type: 'boolean' },
            content_based_deduplication: { type: 'boolean' },
            kms_master_key_id: { type: 'string' },
          },
        },
      },
      subscription_stats: {
        type: {
          type: 'hash',
          fields: {
            total_subscriptions: { type: 'integer' },
            confirmed: { type: 'integer' },
            pending: { type: 'integer' },
            deleted: { type: 'integer' },
          },
        },
      },
      is_fifo: { type: 'boolean' },
      has_kms_encryption: { type: 'boolean' },
      retrieved_at: { type: 'string' },
    },
  },
});

export default getTopic;
