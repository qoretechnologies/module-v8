import { LambdaClient } from '@aws-sdk/client-lambda';
import { DEFAULT_REGION } from '../../../global/helpers/get-amazon-region-allowed-values';
import { AmazonLambdaError } from '../constants';
import { Debugger } from '../../../utils/Debugger';

export interface AWSCredentials {
  access_key_id: string;
  secret_access_key: string;
  region?: string;
}

export const createLambdaClient = (credentials: AWSCredentials): LambdaClient => {
  try {
    return new LambdaClient({
      region: credentials.region || DEFAULT_REGION,
      credentials: {
        accessKeyId: credentials.access_key_id,
        secretAccessKey: credentials.secret_access_key,
      },
    });
  } catch (error) {
    throw new AmazonLambdaError(`Failed to create Lambda client: ${error.message || error}`);
  }
};

export const formatLambdaDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toISOString();
  } catch (error) {
    Debugger.log(`Error formatting Lambda date: ${error.message || error}`);

    return String(dateString);
  }
};

export const formatFileSize = (bytes: number | undefined): string => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatTimeout = (timeoutSeconds: number | undefined): string => {
  if (!timeoutSeconds) return '0 seconds';

  if (timeoutSeconds < 60) {
    return `${timeoutSeconds} seconds`;
  }

  const minutes = Math.floor(timeoutSeconds / 60);
  const seconds = timeoutSeconds % 60;

  if (seconds === 0) {
    return `${minutes} minutes`;
  }

  return `${minutes}m ${seconds}s`;
};

export const formatMemorySize = (memoryMB: number | undefined): string => {
  if (!memoryMB) return '0 MB';

  if (memoryMB < 1024) {
    return `${memoryMB} MB`;
  }

  const gb = (memoryMB / 1024).toFixed(1);
  return `${gb} GB`;
};

export const parseLayerVersionArn = (layerVersionArn: string) => {
  const match = layerVersionArn.match(/arn:aws:lambda:([^:]+):([^:]+):layer:([^:]+):(\d+)/);
  if (!match) {
    throw new AmazonLambdaError(`Invalid layer version ARN: ${layerVersionArn}`);
  }

  return {
    region: match[1],
    accountId: match[2],
    layerName: match[3],
    version: parseInt(match[4], 10),
  };
};

export const parseFunctionArn = (functionArn: string) => {
  const match = functionArn.match(/arn:aws:lambda:([^:]+):([^:]+):function:([^:]+)(?::([^:]+))?/);
  if (!match) {
    throw new AmazonLambdaError(`Invalid function ARN: ${functionArn}`);
  }

  return {
    region: match[1],
    accountId: match[2],
    functionName: match[3],
    qualifier: match[4] || '$LATEST',
  };
};
