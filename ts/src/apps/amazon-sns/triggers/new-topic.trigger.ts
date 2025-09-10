import { GetTopicAttributesCommand, ListTopicsCommand } from '@aws-sdk/client-sns';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
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
} satisfies TQoreOptions;

const AmazonSNSNewTopicTrigger = QoreAppCreator.createLocalizedTrigger({
  app: AMAZON_SNS_APP_NAME,
  action: 'new_topic',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      ErrorClass: AmazonSNSError,
    });

    const region = context?.opts?.region || context?.conn_opts?.region;

    const getItems = () => {
      return fetchLatestTopics({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'amazon_sns_new_topic',
      uniqueField: 'topic_arn',
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
      ErrorClass: AmazonSNSError,
    });

    const topics = await fetchLatestTopics({
      access_key_id,
      secret_access_key,
      region: region || 'us-east-1',
    });

    return topics?.length > 0 ? topics[0] : null;
  },
  event_info: {
    desc: 'Amazon SNS New Topic Trigger Event Info',
    type: {
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
              subscriptions_confirmed: { type: 'integer' },
              subscriptions_pending: { type: 'integer' },
              subscriptions_deleted: { type: 'integer' },
              fifo_topic: { type: 'boolean' },
              content_based_deduplication: { type: 'boolean' },
              kms_master_key_id: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default AmazonSNSNewTopicTrigger;

const fetchLatestTopics = async (options: {
  access_key_id: string;
  secret_access_key: string;
  region: string;
}) => {
  const { access_key_id, secret_access_key, region } = options;

  try {
    const snsClient = createSNSClient({
      access_key_id,
      secret_access_key,
      region,
    });

    const command = new ListTopicsCommand({});
    const response = await snsClient.send(command);

    const topics: any[] = [];

    if (response.Topics) {
      for (const topic of response.Topics) {
        if (topic.TopicArn) {
          try {
            const attributesCommand = new GetTopicAttributesCommand({
              TopicArn: topic.TopicArn,
            });
            const attributesResponse = await snsClient.send(attributesCommand);

            topics.push({
              topic_arn: topic.TopicArn,
              topic_name: parseTopicArnToName(topic.TopicArn),
              region,
              console_url: `https://console.aws.amazon.com/sns/v3/home?region=${region}#/topic/${topic.TopicArn}`,
              attributes: {
                display_name: attributesResponse.Attributes?.DisplayName || '',
                owner: attributesResponse.Attributes?.Owner || '',
                subscriptions_confirmed: parseInt(
                  attributesResponse.Attributes?.SubscriptionsConfirmed || '0'
                ),
                subscriptions_pending: parseInt(
                  attributesResponse.Attributes?.SubscriptionsPending || '0'
                ),
                subscriptions_deleted: parseInt(
                  attributesResponse.Attributes?.SubscriptionsDeleted || '0'
                ),
                fifo_topic: attributesResponse.Attributes?.FifoTopic === 'true',
                content_based_deduplication:
                  attributesResponse.Attributes?.ContentBasedDeduplication === 'true',
                kms_master_key_id: attributesResponse.Attributes?.KmsMasterKeyId || '',
              },
            });
          } catch (error) {
            topics.push({
              topic_arn: topic.TopicArn,
              topic_name: parseTopicArnToName(topic.TopicArn),
              region,
              console_url: `https://console.aws.amazon.com/sns/v3/home?region=${region}#/topic/${topic.TopicArn}`,
              attributes: {
                display_name: '',
                owner: '',
                subscriptions_confirmed: 0,
                subscriptions_pending: 0,
                subscriptions_deleted: 0,
                fifo_topic: false,
                content_based_deduplication: false,
                kms_master_key_id: '',
              },
            });
          }
        }
      }
    }

    return topics;
  } catch (error) {
    throw new AmazonSNSError(`Failed to fetch latest topics: ${error.message || error}`);
  }
};
