import { SubscribeCommand } from '@aws-sdk/client-sns';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_SNS_APP_NAME, AmazonSNSError } from '../constants';
import { createSNSClient } from '../helpers/constants';
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
  protocol: {
    required: true,
    type: 'string',
    allowed_values: [
      { value: 'http', display_name: 'HTTP' },
      { value: 'https', display_name: 'HTTPS' },
      { value: 'email', display_name: 'Email' },
      { value: 'email-json', display_name: 'Email-JSON' },
      { value: 'sms', display_name: 'SMS' },
      { value: 'sqs', display_name: 'SQS' },
      { value: 'lambda', display_name: 'Lambda' },
      { value: 'application', display_name: 'Application' },
    ],
  },
  endpoint: {
    required: true,
    type: 'string',
  },
} satisfies TQoreOptions;

const addSubscriber = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_SNS_APP_NAME,
  action: 'add_subscriber',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, topic_arn, endpoint, protocol } =
      getQoreContextRequiredValues({
        context: { ...context, opts: obj },
        connectionFields: ['access_key_id', 'secret_access_key'],
        optionFields: ['topic_arn', 'endpoint', 'protocol'],
        ErrorClass: AmazonSNSError,
      });

    const region = obj?.region || context?.conn_opts?.region;

    try {
      const snsClient = createSNSClient({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const command = new SubscribeCommand({
        TopicArn: topic_arn,
        Protocol: protocol,
        Endpoint: endpoint,
        ReturnSubscriptionArn: true,
      });

      const response = await snsClient.send(command);

      return {
        subscription_arn: response.SubscriptionArn,
      };
    } catch (error) {
      throw new AmazonSNSError(`Failed to add subscriber: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      subscription_arn: { type: 'string' },
    },
  },
});

export default addSubscriber;
