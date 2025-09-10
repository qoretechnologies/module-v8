import { SQSClient } from '@aws-sdk/client-sqs';
import { DEFAULT_REGION } from '../../../global/helpers/get-amazon-region-allowed-values';
import { AmazonSQSError } from '../constants';

export interface AWSCredentials {
  access_key_id: string;
  secret_access_key: string;
  region?: string;
}

export const createSQSClient = (credentials: AWSCredentials): SQSClient => {
  try {
    return new SQSClient({
      region: credentials.region || DEFAULT_REGION,
      credentials: {
        accessKeyId: credentials.access_key_id,
        secretAccessKey: credentials.secret_access_key,
      },
    });
  } catch (error) {
    throw new AmazonSQSError(`Failed to create SQS client: ${error.message || error}`);
  }
};

export const formatSQSDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toISOString();
  } catch {
    return String(dateString);
  }
};

export const formatMessageSize = (bytes: number | undefined): string => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const extractQueueNameFromUrl = (queueUrl: string): string => {
  try {
    const url = new URL(queueUrl);
    const pathParts = url.pathname.split('/');

    return pathParts[pathParts.length - 1] || '';
  } catch {
    return '';
  }
};

export const buildQueueArn = (region: string, accountId: string, queueName: string): string => {
  return `arn:aws:sqs:${region}:${accountId}:${queueName}`;
};

export const parseMessageAttributes = (attributes: Record<string, any>): Record<string, any> => {
  const parsed: Record<string, any> = {};

  for (const [key, value] of Object.entries(attributes || {})) {
    if (value && typeof value === 'object' && value.StringValue !== undefined) {
      parsed[key] = value.StringValue;
    } else if (value && typeof value === 'object' && value.BinaryValue !== undefined) {
      parsed[key] = value.BinaryValue;
    } else if (value && typeof value === 'object' && value.DataType) {
      parsed[key] = {
        value: value.StringValue || value.BinaryValue || '',
        dataType: value.DataType,
      };
    } else {
      parsed[key] = value;
    }
  }

  return parsed;
};

export const buildMessageAttributes = (attributes: Record<string, any>): Record<string, any> => {
  const built: Record<string, any> = {};

  for (const [key, value] of Object.entries(attributes || {})) {
    if (typeof value === 'string') {
      built[key] = {
        StringValue: value,
        DataType: 'String',
      };
    } else if (typeof value === 'number') {
      built[key] = {
        StringValue: value.toString(),
        DataType: 'Number',
      };
    } else if (value && typeof value === 'object' && value.dataType) {
      built[key] = {
        [value.dataType === 'Binary' ? 'BinaryValue' : 'StringValue']: value.value,
        DataType: value.dataType,
      };
    } else {
      built[key] = {
        StringValue: String(value),
        DataType: 'String',
      };
    }
  }

  return built;
};
