import { DescribeRegionsCommand } from '@aws-sdk/client-ec2';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AmazonEC2Error, AWS_REGIONS } from '../constants';
import { createEC2Client } from './constants';

export const getAmazonEc2RegionAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
    context,
    connectionFields: ['access_key_id', 'secret_access_key'],
    ErrorClass: AmazonEC2Error,
  });

  try {
    const ec2Client = createEC2Client({
      access_key_id,
      secret_access_key,
      region: 'us-east-1',
    });

    const command = new DescribeRegionsCommand({
      AllRegions: false,
    });

    const response = await ec2Client.send(command);

    if (response.Regions && response.Regions.length > 0) {
      const allowedValues: IQoreAllowedValue<string>[] = response.Regions.map((region) => {
        const staticRegion = AWS_REGIONS.find((r) => r.value === region.RegionName);
        const displayName = staticRegion?.display_name || region.RegionName || 'Unknown Region';

        return {
          value: region.RegionName || '',
          display_name: displayName,
          desc: `Endpoint: ${region.Endpoint || 'N/A'}\nOpt-in Status: ${region.OptInStatus || 'N/A'}`,
        };
      });

      return allowedValues.filter((region) => region.value);
    }
  } catch (error) {
    console.warn(
      `Failed to fetch regions dynamically, falling back to static list: ${error.message}`
    );
  }

  return AWS_REGIONS.map((region) => ({
    value: region.value,
    display_name: region.display_name,
    desc: `AWS Region: ${region.display_name}`,
  }));
};

export const getStaticRegionAllowedValues = (): IQoreAllowedValue<string>[] => {
  return AWS_REGIONS.map((region) => ({
    value: region.value,
    display_name: region.display_name,
    desc: `AWS Region: ${region.display_name}`,
  }));
};
