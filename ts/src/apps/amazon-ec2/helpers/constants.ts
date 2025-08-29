import { EC2Client } from '@aws-sdk/client-ec2';
import { AmazonEC2Error, DEFAULT_REGION } from '../constants';

export interface AWSCredentials {
  access_key_id: string;
  secret_access_key: string;
  region?: string;
}

export const createEC2Client = (credentials: AWSCredentials): EC2Client => {
  try {
    return new EC2Client({
      region: credentials.region || DEFAULT_REGION,
      credentials: {
        accessKeyId: credentials.access_key_id,
        secretAccessKey: credentials.secret_access_key,
      },
    });
  } catch (error) {
    throw new AmazonEC2Error(`Failed to create EC2 client: ${error.message || error}`);
  }
};

export const formatEC2Date = (dateString: string | Date | undefined): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toISOString();
  } catch {
    return String(dateString);
  }
};
