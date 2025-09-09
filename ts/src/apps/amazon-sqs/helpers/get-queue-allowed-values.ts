import { ListQueuesCommand } from '@aws-sdk/client-sqs';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AmazonSQSError } from '../constants';
import { createSQSClient, extractQueueNameFromUrl } from './constants';

export const getAmazonSQSQueueAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
    context,
    connectionFields: ['access_key_id', 'secret_access_key'],
    ErrorClass: AmazonSQSError,
  });

  const region = context?.opts?.region || context?.conn_opts?.region;

  try {
    const sqsClient = createSQSClient({
      access_key_id,
      secret_access_key,
      region,
    });

    const command = new ListQueuesCommand({
      MaxResults: 1000,
    });
    const response = await sqsClient.send(command);

    const allowedValues: IQoreAllowedValue<string>[] = [];

    if (response.QueueUrls) {
      for (const queueUrl of response.QueueUrls) {
        const queueName = extractQueueNameFromUrl(queueUrl);
        
        allowedValues.push({
          value: queueUrl,
          display_name: queueName,
          desc: `Queue URL: ${queueUrl}\nQueue Name: ${queueName}`,
        });
      }
    }

    return allowedValues;
  } catch (error) {
    throw new AmazonSQSError(`Failed to fetch queue URLs: ${error.message || error}`);
  }
};
