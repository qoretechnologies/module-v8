import { ListSubscriptionsByTopicCommand } from '@aws-sdk/client-sns';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AmazonSNSError } from '../constants';
import { createSNSClient } from './constants';

export const getAmazonSNSSubscriptionAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { access_key_id, secret_access_key, topic_arn } = getQoreContextRequiredValues({
    context,
    connectionFields: ['access_key_id', 'secret_access_key'],
    optionFields: ['topic_arn'],
    ErrorClass: AmazonSNSError,
  });

  const region = context?.opts?.region || context?.conn_opts?.region;

  try {
    const snsClient = createSNSClient({
      access_key_id,
      secret_access_key,
      region,
    });

    const command = new ListSubscriptionsByTopicCommand({
      TopicArn: topic_arn,
    });

    const response = await snsClient.send(command);

    const allowedValues: IQoreAllowedValue<string>[] = [];

    if (response.Subscriptions) {
      for (const subscription of response.Subscriptions) {
        if (subscription.SubscriptionArn && subscription.Endpoint) {
          allowedValues.push({
            value: subscription.SubscriptionArn,
            display_name: `${subscription.Protocol}: ${subscription.Endpoint}`,
            desc: `Protocol: ${subscription.Protocol}\n` + `Endpoint: ${subscription.Endpoint}\n`,
          });
        }
      }
    }

    return allowedValues;
  } catch (error) {
    throw new AmazonSNSError(`Failed to fetch subscription ARNs: ${error.message || error}`);
  }
};
