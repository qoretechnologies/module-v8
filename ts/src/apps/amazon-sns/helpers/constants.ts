import { SNSClient } from '@aws-sdk/client-sns';
import { DEFAULT_REGION } from '../../../global/helpers/get-amazon-region-allowed-values';
import { AmazonSNSError } from '../constants';

export interface AWSCredentials {
  access_key_id: string;
  secret_access_key: string;
  region?: string;
}

export const AMAZON_SNS_MAX_ATRIBUTE_NAME_LENGTH = 256;
export const AMAZON_SNS_MAX_ATTRIBUTE_NUNBER = 10;

export const createSNSClient = (credentials: AWSCredentials): SNSClient => {
  try {
    return new SNSClient({
      region: credentials.region || DEFAULT_REGION,
      credentials: {
        accessKeyId: credentials.access_key_id,
        secretAccessKey: credentials.secret_access_key,
      },
    });
  } catch (error) {
    throw new AmazonSNSError(`Failed to create SNS client: ${error.message || error}`);
  }
};

export const formatSNSDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toISOString();
  } catch {
    return String(dateString);
  }
};

export const parseTopicArnToName = (topicArn: string): string => {
  const parts = topicArn.split(':');

  return parts.length >= 6 ? parts[5] : topicArn;
};

export const buildTopicArn = (region: string, accountId: string, topicName: string): string => {
  return `arn:aws:sns:${region}:${accountId}:${topicName}`;
};

export const validateMessageAttributes = (attributes: Record<string, any>): void => {
  if (!attributes) return;

  const attributeCount = Object.keys(attributes).length;
  if (attributeCount > AMAZON_SNS_MAX_ATTRIBUTE_NUNBER) {
    throw new AmazonSNSError(
      `Message attributes limit exceeded. ` +
        `Maximum ${AMAZON_SNS_MAX_ATTRIBUTE_NUNBER} attributes allowed, got ${attributeCount}`
    );
  }

  for (const [key, value] of Object.entries(attributes)) {
    if (key.length > AMAZON_SNS_MAX_ATRIBUTE_NAME_LENGTH) {
      throw new AmazonSNSError(
        `Message attribute name '${key}' exceeds ${AMAZON_SNS_MAX_ATRIBUTE_NAME_LENGTH} characters`
      );
    }

    if (typeof value === 'string' && value.length > AMAZON_SNS_MAX_ATRIBUTE_NAME_LENGTH) {
      throw new AmazonSNSError(
        `Message attribute value for '${key}' exceeds ${AMAZON_SNS_MAX_ATRIBUTE_NAME_LENGTH} characters`
      );
    }
  }
};

export const formatMessageAttributes = (attributes: Record<string, any>): Record<string, any> => {
  if (!attributes) return {};

  const formattedAttributes: Record<string, any> = {};

  for (const [key, value] of Object.entries(attributes)) {
    if (typeof value === 'string') {
      formattedAttributes[key] = {
        DataType: 'String',
        StringValue: value,
      };
    } else if (typeof value === 'number') {
      formattedAttributes[key] = {
        DataType: 'Number',
        StringValue: value.toString(),
      };
    } else if (Buffer.isBuffer(value)) {
      formattedAttributes[key] = {
        DataType: 'Binary',
        BinaryValue: value,
      };
    } else {
      formattedAttributes[key] = {
        DataType: 'String',
        StringValue: JSON.stringify(value),
      };
    }
  }

  return formattedAttributes;
};
