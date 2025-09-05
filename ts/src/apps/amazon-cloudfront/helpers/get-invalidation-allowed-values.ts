import { ListInvalidationsCommand } from '@aws-sdk/client-cloudfront';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AmazonCloudFrontError } from '../constants';
import { createCloudFrontClient, formatCloudFrontDate } from './constants';

export const getAmazonCloudFrontInvalidationAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { access_key_id, secret_access_key, distribution_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['access_key_id', 'secret_access_key'],
    optionFields: ['distribution_id'],
    ErrorClass: AmazonCloudFrontError,
  });

  try {
    const cloudFrontClient = createCloudFrontClient({
      access_key_id,
      secret_access_key,
      region: 'us-east-1',
    });

    const command = new ListInvalidationsCommand({
      DistributionId: distribution_id,
      MaxItems: 100,
    });

    const response = await cloudFrontClient.send(command);

    const allowedValues: IQoreAllowedValue<string>[] = [];

    if (response.InvalidationList && response.InvalidationList.Items) {
      for (const invalidation of response.InvalidationList.Items) {
        if (invalidation.Id) {
          allowedValues.push({
            value: invalidation.Id,
            display_name: `${invalidation.Id}`,
            desc:
              `Status: ${invalidation.Status}\n` +
              `Created: ${formatCloudFrontDate(invalidation.CreateTime)}`,
          });
        }
      }
    }

    return allowedValues;
  } catch (error) {
    throw new AmazonCloudFrontError(`Failed to fetch invalidation IDs: ${error.message || error}`);
  }
};
