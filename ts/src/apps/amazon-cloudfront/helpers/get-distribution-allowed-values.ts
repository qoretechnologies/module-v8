import { ListDistributionsCommand } from '@aws-sdk/client-cloudfront';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AmazonCloudFrontError } from '../constants';
import { createCloudFrontClient, formatCloudFrontDate, formatCloudFrontStatus } from './constants';

export const getAmazonCloudFrontDistributionAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
    context,
    connectionFields: ['access_key_id', 'secret_access_key'],
    ErrorClass: AmazonCloudFrontError,
  });

  try {
    const cloudFrontClient = createCloudFrontClient({
      access_key_id,
      secret_access_key,
      region: 'us-east-1',
    });

    const command = new ListDistributionsCommand({});
    const response = await cloudFrontClient.send(command);

    const allowedValues: IQoreAllowedValue<string>[] = [];

    if (response.DistributionList && response.DistributionList.Items) {
      for (const distribution of response.DistributionList.Items) {
        if (distribution.Id) {
          allowedValues.push({
            value: distribution.Id,
            display_name: distribution.Comment || distribution.DomainName || distribution.Id,
            desc:
              `Domain: ${distribution.DomainName}\n` +
              `Status: ${formatCloudFrontStatus(distribution.Status || '')}\n` +
              `Enabled: ${distribution.Enabled ? 'Yes' : 'No'}\n` +
              `Last Modified: ${formatCloudFrontDate(distribution.LastModifiedTime)}`,
          });
        }
      }
    }

    return allowedValues;
  } catch (error) {
    throw new AmazonCloudFrontError(`Failed to fetch distribution IDs: ${error.message || error}`);
  }
};
