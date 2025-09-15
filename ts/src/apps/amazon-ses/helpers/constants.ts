import { SESClient } from '@aws-sdk/client-ses';
import { DEFAULT_REGION } from '../../../global/helpers/get-amazon-region-allowed-values';
import { AmazonSESError } from '../constants';

export interface AWSCredentials {
  access_key_id: string;
  secret_access_key: string;
  region?: string;
}

export const createSESClient = (credentials: AWSCredentials): SESClient => {
  try {
    return new SESClient({
      region: credentials.region || DEFAULT_REGION,
      credentials: {
        accessKeyId: credentials.access_key_id,
        secretAccessKey: credentials.secret_access_key,
      },
    });
  } catch (error) {
    throw new AmazonSESError(`Failed to create SES client: ${error.message || error}`);
  }
};

export const formatSESDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toISOString();
  } catch {
    return String(dateString);
  }
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
};

export const parseEmailList = (emails: string): string[] => {
  return emails
    .split(',')
    .map((email) => email.trim())
    .filter((email) => email && isValidEmail(email));
};
