import { DescribeInstancesCommand } from '@aws-sdk/client-ec2';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AmazonEC2Error } from '../constants';
import { createEC2Client } from './constants';

export const getAmazonEc2InstanceIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { access_key_id, secret_access_key, region } = getQoreContextRequiredValues({
    context,
    connectionFields: ['access_key_id', 'secret_access_key'],
    optionFields: ['region'],
    ErrorClass: AmazonEC2Error,
  });

  try {
    const ec2Client = createEC2Client({
      access_key_id,
      secret_access_key,
      region,
    });

    const command = new DescribeInstancesCommand({
      MaxResults: 100,
    });

    const response = await ec2Client.send(command);
    const allowedValues: IQoreAllowedValue<string>[] = [];

    if (response.Reservations) {
      for (const reservation of response.Reservations) {
        if (reservation.Instances) {
          for (const instance of reservation.Instances) {
            if (instance.InstanceId) {
              const state = instance.State?.Name || 'unknown';
              const instanceType = instance.InstanceType || 'unknown';
              const availabilityZone = instance.Placement?.AvailabilityZone || 'unknown';
              const nameTag = instance.Tags?.find((tag) => tag.Key === 'Name')?.Value;

              allowedValues.push({
                value: instance.InstanceId,
                display_name: `${nameTag || instance.InstanceId} (${state})`,
                desc:
                  `Type: ${instanceType}\n` +
                  `State: ${state}\n` +
                  `AZ: ${availabilityZone}\n` +
                  `Image: ${instance.ImageId || 'unknown'}`,
              });
            }
          }
        }
      }
    }

    return allowedValues;
  } catch (error) {
    throw new AmazonEC2Error(`Failed to fetch instance IDs: ${error.message || error}`);
  }
};
