import { DescribeAlarmsCommand } from '@aws-sdk/client-cloudwatch';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AmazonCloudWatchError } from '../constants';
import { createCloudWatchClient } from './constants';

export const getAmazonCloudWatchAlarmAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
    context,
    connectionFields: ['access_key_id', 'secret_access_key'],
    ErrorClass: AmazonCloudWatchError,
  });

  const region = context?.opts?.region || context?.conn_opts?.region;

  try {
    const cloudWatchClient = createCloudWatchClient({
      access_key_id,
      secret_access_key,
      region,
    });

    const command = new DescribeAlarmsCommand({
      MaxRecords: 100,
    });

    const response = await cloudWatchClient.send(command);
    const allowedValues: IQoreAllowedValue<string>[] = [];

    if (response.MetricAlarms) {
      for (const alarm of response.MetricAlarms) {
        if (alarm.AlarmName) {
          allowedValues.push({
            value: alarm.AlarmName,
            display_name: alarm.AlarmName,
            desc:
              `State: ${alarm.StateValue || 'Unknown'}\n` +
              `Reason: ${alarm.StateReason || 'No reason'}\n` +
              `Metric: ${alarm.MetricName || 'Unknown'}\n` +
              `Namespace: ${alarm.Namespace || 'Unknown'}`,
          });
        }
      }
    }

    return allowedValues;
  } catch (error) {
    throw new AmazonCloudWatchError(`Failed to fetch alarm names: ${error.message || error}`);
  }
};
