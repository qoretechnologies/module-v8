import { S3Client } from '@aws-sdk/client-s3';
import { DEFAULT_REGION } from '../../../global/helpers/get-amazon-region-allowed-values';
import { AmazonS3Error } from '../constants';

export interface AWSCredentials {
  access_key_id: string;
  secret_access_key: string;
  region?: string;
}

export const createS3Client = (credentials: AWSCredentials): S3Client => {
  try {
    return new S3Client({
      region: credentials.region || DEFAULT_REGION,
      credentials: {
        accessKeyId: credentials.access_key_id,
        secretAccessKey: credentials.secret_access_key,
      },
    });
  } catch (error) {
    throw new AmazonS3Error(`Failed to create S3 client: ${error.message || error}`);
  }
};

export const formatS3Date = (dateString: string | Date | undefined): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toISOString();
  } catch {
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

export const extractBucketFromS3Url = (s3Url: string): string => {
  const match = s3Url.match(/^s3:\/\/([^\/]+)/);

  return match ? match[1] : '';
};

export const extractKeyFromS3Url = (s3Url: string): string => {
  const match = s3Url.match(/^s3:\/\/[^\/]+\/(.+)$/);

  return match ? match[1] : '';
};

export const buildS3Url = (bucket: string, key: string): string => {
  return `s3://${bucket}/${key}`;
};
