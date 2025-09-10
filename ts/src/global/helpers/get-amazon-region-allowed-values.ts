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

export const DEFAULT_REGION = 'us-east-1';

export const AWS_REGIONS = [
  { value: 'us-east-1', display_name: 'US East (N. Virginia)' },
  { value: 'us-east-2', display_name: 'US East (Ohio)' },
  { value: 'us-west-1', display_name: 'US West (N. California)' },
  { value: 'us-west-2', display_name: 'US West (Oregon)' },
  { value: 'ap-east-1', display_name: 'Asia Pacific (Hong Kong)' },
  { value: 'ap-south-1', display_name: 'Asia Pacific (Mumbai)' },
  { value: 'ap-northeast-1', display_name: 'Asia Pacific (Tokyo)' },
  { value: 'ap-northeast-2', display_name: 'Asia Pacific (Seoul)' },
  { value: 'ap-northeast-3', display_name: 'Asia Pacific (Osaka)' },
  { value: 'ap-southeast-1', display_name: 'Asia Pacific (Singapore)' },
  { value: 'ap-southeast-2', display_name: 'Asia Pacific (Sydney)' },
  { value: 'ca-central-1', display_name: 'Canada (Central)' },
  { value: 'eu-central-1', display_name: 'Europe (Frankfurt)' },
  { value: 'eu-west-1', display_name: 'Europe (Ireland)' },
  { value: 'eu-west-2', display_name: 'Europe (London)' },
  { value: 'eu-west-3', display_name: 'Europe (Paris)' },
  { value: 'eu-north-1', display_name: 'Europe (Stockholm)' },
  { value: 'sa-east-1', display_name: 'South America (São Paulo)' },
];

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
