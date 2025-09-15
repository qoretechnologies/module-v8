import { CloudWatchClient } from '@aws-sdk/client-cloudwatch';
import { DEFAULT_REGION } from '../../../global/helpers/get-amazon-region-allowed-values';
import { AmazonCloudWatchError } from '../constants';

export interface AWSCredentials {
  access_key_id: string;
  secret_access_key: string;
  region?: string;
}

export const createCloudWatchClient = (credentials: AWSCredentials): CloudWatchClient => {
  try {
    return new CloudWatchClient({
      region: credentials.region || DEFAULT_REGION,
      credentials: {
        accessKeyId: credentials.access_key_id,
        secretAccessKey: credentials.secret_access_key,
      },
    });
  } catch (error) {
    throw new AmazonCloudWatchError(`Failed to create CloudWatch client: ${error.message || error}`);
  }
};

export const formatCloudWatchDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toISOString();
  } catch {
    return String(dateString);
  }
};

export const formatAlarmStateTrigger = (state: string): string => {
  switch (state) {
    case 'OK':
      return 'OK';
    case 'ALARM':
      return 'ALARM';
    case 'INSUFFICIENT_DATA':
      return 'INSUFFICIENT_DATA';
    default:
      return state;
  }
};

export const buildCloudWatchConsoleUrl = (
  region: string,
  alarmName: string
): string => {
  return `https://console.aws.amazon.com/cloudwatch/home?region=${region}#alarmsV2:alarm/${encodeURIComponent(alarmName)}`;
};
