import { CloudFrontClient } from '@aws-sdk/client-cloudfront';
import { DEFAULT_REGION } from '../../../global/helpers/get-amazon-region-allowed-values';
import { AmazonCloudFrontError } from '../constants';

export interface AWSCredentials {
  access_key_id: string;
  secret_access_key: string;
  region?: string;
}

export const createCloudFrontClient = (credentials: AWSCredentials): CloudFrontClient => {
  try {
    return new CloudFrontClient({
      region: credentials.region || DEFAULT_REGION,
      credentials: {
        accessKeyId: credentials.access_key_id,
        secretAccessKey: credentials.secret_access_key,
      },
    });
  } catch (error) {
    throw new AmazonCloudFrontError(
      `Failed to create CloudFront client: ${error.message || error}`
    );
  }
};

export const formatCloudFrontDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toISOString();
  } catch {
    return String(dateString);
  }
};

export const extractDistributionDomainFromArn = (arn: string): string => {
  const match = arn.match(/arn:aws:cloudfront::[^:]+:distribution\/([^\/]+)/);

  return match ? match[1] : '';
};

export const buildCloudFrontUrl = (distributionDomain: string, path: string = ''): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `https://${distributionDomain}${cleanPath}`;
};

export const formatCloudFrontStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    InProgress: 'In Progress',
    Deployed: 'Deployed',
  };

  return statusMap[status] || status;
};
