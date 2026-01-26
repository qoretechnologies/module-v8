import { SubscribeCommand, UnsubscribeCommand } from '@aws-sdk/client-sns';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_SNS_APP_NAME, AmazonSNSError } from '../constants';
import { createSNSClient } from '../helpers/constants';
import { getAmazonSNSTopicAllowedValues } from '../helpers/get-topic-allowed-values';

const trigger = 'new_message';

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

const AmazonSNSNewMessage = QoreAppCreator.createLocalizedTrigger<typeof options>({
  action: trigger,
  app: AMAZON_SNS_APP_NAME,
  action_code: EQoreAppActionCode.EVENT,
  webhook_assume_json: 'text/plain',
  webhook_method: 'POST',
  webhook_confirmation_key_loc: 'Type',
  webhook_confirmation_value: 'SubscriptionConfirmation',
  webhook_confirmation_method: 'GET',
  webhook_confirmation_url_loc: 'SubscribeURL',
  options,
  webhook_register: async (context, url) => {
    const { access_key_id, secret_access_key, topic_arn } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['topic_arn'],
      ErrorClass: AmazonSNSError,
    });

    const region = context?.opts?.region || context?.conn_opts?.region;

    const snsClient = createSNSClient({
      access_key_id,
      secret_access_key,
      region: region || 'us-east-1',
    });

    const command = new SubscribeCommand({
      TopicArn: topic_arn,
      Protocol: 'https',
      Endpoint: url,
      ReturnSubscriptionArn: true,
    });

    const response = await snsClient.send(command);

    return { subscription_arn: response.SubscriptionArn };
  },
  webhook_deregister: async (context, _url, regInfo) => {
    const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      ErrorClass: AmazonSNSError,
    });

    const region = context?.opts?.region || context?.conn_opts?.region;

    const subscriptionArn = regInfo.subscription_arn;

    if (!subscriptionArn) {
      throw new AmazonSNSError('Subscription ARN is required for deregistration.');
    }

    const snsClient = createSNSClient({
      access_key_id,
      secret_access_key,
      region: region || 'us-east-1',
    });

    const command = new UnsubscribeCommand({
      SubscriptionArn: subscriptionArn,
    });

    await snsClient.send(command);
  },
  get_example_event_data: (context) => {
    const topicArn = context?.opts?.topic_arn;

    return {
      Type: 'Notification',
      MessageId: '12345678-1234-1234-1234-12345678901',
      TopicArn: topicArn,
      Subject: 'Qorus Test JSON Message',
      Message: '{"test_key":"test_value"}',
      Timestamp: '2025-09-08T16:47:05.363Z',
      SignatureVersion: '1',
      Signature: 'EXAMPLEpH+..',
      SigningCertURL: `https://example.com`,
      UnsubscribeURL: `https://example.com`,
      MessageAttributes: {},
    };
  },
  event_info: {
    desc: 'New Message data',
    type: {
      type: 'hash',
      fields: {
        Type: { type: 'string' },
        MessageId: { type: 'string' },
        TopicArn: { type: 'string' },
        Subject: { type: 'string' },
        Message: { type: 'string' },
        Timestamp: { type: 'string' },
        SignatureVersion: { type: 'string' },
        Signature: { type: 'string' },
        SigningCertURL: { type: 'string' },
        UnsubscribeURL: { type: 'string' },
        MessageAttributes: { type: 'hash' },
      },
    },
  },
});

export default AmazonSNSNewMessage;
