import { DescribeRegionsCommand } from '@aws-sdk/client-ec2';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
  TQoreGetDefaultValueFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '.';
import { createEC2Client } from '../../apps/amazon-ec2/helpers/constants';
import { Debugger } from '../../utils/Debugger';

export class AmazonError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AmazonError';
  }
}

import { AWS_REGIONS, DEFAULT_REGION } from './aws-regions';

export { AWS_REGIONS, DEFAULT_REGION };

export const getAWSRegionAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
    context,
    connectionFields: ['access_key_id', 'secret_access_key'],
    ErrorClass: AmazonError,
  });

  try {
    const region = context?.conn_opts?.region || 'us-east-1';

    const ec2Client = createEC2Client({
      access_key_id,
      secret_access_key,
      region,
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
    Debugger.log(
      `Failed to fetch regions dynamically, falling back to static list: ${error.message || error}`
    );
  }

  return AWS_REGIONS.map((region) => ({
    value: region.value,
    display_name: region.display_name,
    desc: `AWS Region: ${region.display_name}`,
  }));
};

export const getAmazonDefaultRegion: TQoreGetDefaultValueFunction<TCustomConnOptions, string> = (
  context
) => {
  const region = context?.conn_opts?.region || DEFAULT_REGION;

  return region;
};
