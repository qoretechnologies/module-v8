import { GetTopicAttributesCommand, ListTopicsCommand } from '@aws-sdk/client-sns';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_SNS_APP_NAME, AmazonSNSError } from '../constants';
import { createSNSClient, parseTopicArnToName } from '../helpers/constants';

const options = {
  region: {
    required: false,
    preselected: true,
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAWSRegionAllowedValues,
  },
  include_attributes: {
    required: false,
    type: 'boolean',
    default_value: true,
  },
  next_token: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const listTopics = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_SNS_APP_NAME,
  action: 'list_topics',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      ErrorClass: AmazonSNSError,
    });

    const region = obj?.region || context?.conn_opts?.region;
    const { include_attributes, next_token } = obj || {};

    try {
      const snsClient = createSNSClient({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const command = new ListTopicsCommand({
        ...(next_token && { NextToken: next_token }),
      });

      const response = await snsClient.send(command);

      const topics: any[] = [];

      if (response.Topics) {
        for (const topic of response.Topics) {
          if (topic.TopicArn) {
            const topicData: any = {
              topic_arn: topic.TopicArn,
              topic_name: parseTopicArnToName(topic.TopicArn),
              console_url: `https://console.aws.amazon.com/sns/v3/home?region=${region}#/topic/${topic.TopicArn}`,
            };

            if (include_attributes) {
              try {
                const attributesCommand = new GetTopicAttributesCommand({
                  TopicArn: topic.TopicArn,
                });
                const attributesResponse = await snsClient.send(attributesCommand);

                topicData.attributes = {
                  display_name: attributesResponse.Attributes?.DisplayName || '',
                  owner: attributesResponse.Attributes?.Owner || '',
                  policy: attributesResponse.Attributes?.Policy || '',
                  delivery_policy: attributesResponse.Attributes?.DeliveryPolicy || '',
                  subscriptions_confirmed: parseInt(
                    attributesResponse.Attributes?.SubscriptionsConfirmed || '0'
                  ),
                  subscriptions_pending: parseInt(
                    attributesResponse.Attributes?.SubscriptionsPending || '0'
                  ),
                  subscriptions_deleted: parseInt(
                    attributesResponse.Attributes?.SubscriptionsDeleted || '0'
                  ),
                  effective_delivery_policy:
                    attributesResponse.Attributes?.EffectiveDeliveryPolicy || '',
                  fifo_topic: attributesResponse.Attributes?.FifoTopic === 'true',
                  content_based_deduplication:
                    attributesResponse.Attributes?.ContentBasedDeduplication === 'true',
                  kms_master_key_id: attributesResponse.Attributes?.KmsMasterKeyId || '',
                };
              } catch (attributeError) {
                topicData.attributes = null;
                topicData.attribute_error = `Failed to fetch attributes: ${attributeError.message}`;
              }
            }

            topics.push(topicData);
          }
        }
      }

      return {
        topic_count: topics.length,
        topics,
        next_token: response.NextToken || '',
        include_attributes: include_attributes || true,
        region: region || 'us-east-1',
        retrieved_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new AmazonSNSError(`Failed to list topics: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      topic_count: { type: 'integer' },
      topics: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              topic_arn: { type: 'string' },
              topic_name: { type: 'string' },
              console_url: { type: 'string' },
              attributes: {
                type: {
                  type: 'hash',
                  fields: {
                    display_name: { type: 'string' },
                    owner: { type: 'string' },
                    policy: { type: 'string' },
                    delivery_policy: { type: 'string' },
                    subscriptions_confirmed: { type: 'integer' },
                    subscriptions_pending: { type: 'integer' },
                    subscriptions_deleted: { type: 'integer' },
                    effective_delivery_policy: { type: 'string' },
                    fifo_topic: { type: 'boolean' },
                    content_based_deduplication: { type: 'boolean' },
                    kms_master_key_id: { type: 'string' },
                  },
                },
              },
              attribute_error: { type: 'string' },
            },
          },
        },
      },
      next_token: { type: 'string' },
      include_attributes: { type: 'boolean' },
      region: { type: 'string' },
      retrieved_at: { type: 'string' },
    },
  },
});

export default listTopics;
