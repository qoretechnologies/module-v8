import { ListTopicsCommand } from '@aws-sdk/client-sns';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AmazonSNSError } from '../constants';
import { createSNSClient, parseTopicArnToName } from './constants';

export const getAmazonSNSTopicAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
    context,
    connectionFields: ['access_key_id', 'secret_access_key'],
    ErrorClass: AmazonSNSError,
  });

  const region = context?.opts?.region || context?.conn_opts?.region;

  try {
    const snsClient = createSNSClient({
      access_key_id,
      secret_access_key,
      region,
    });

    const command = new ListTopicsCommand({});
    const response = await snsClient.send(command);

    const allowedValues: IQoreAllowedValue<string>[] = [];

    if (response.Topics) {
      for (const topic of response.Topics) {
        if (topic.TopicArn) {
          const topicName = parseTopicArnToName(topic.TopicArn);
          allowedValues.push({
            value: topic.TopicArn,
            display_name: topicName,
          });
        }
      }
    }

    return allowedValues;
  } catch (error) {
    throw new AmazonSNSError(`Failed to fetch topic ARNs: ${error.message || error}`);
  }
};
