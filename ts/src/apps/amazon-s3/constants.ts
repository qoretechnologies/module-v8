import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';
import { AWS_REGIONS } from '../amazon-ec2/constants';

export class AmazonS3Error extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AmazonS3Error';
  }
}

export const AMAZON_S3_APP_NAME = 'AmazonS3';
export const AMAZON_S3_APP_LOGO =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MjgiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNDI4IDUxMiI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5jbHMtMSB7CiAgICAgICAgZmlsbDogI2UyNTQ0NDsKICAgICAgfQoKICAgICAgLmNscy0xLCAuY2xzLTIsIC5jbHMtMyB7CiAgICAgICAgZmlsbC1ydWxlOiBldmVub2RkOwogICAgICB9CgogICAgICAuY2xzLTIgewogICAgICAgIGZpbGw6ICM3YjFkMTM7CiAgICAgIH0KCiAgICAgIC5jbHMtMyB7CiAgICAgICAgZmlsbDogIzU4MTUwZDsKICAgICAgfQogICAgPC9zdHlsZT4KICA8L2RlZnM+CiAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMzc4LDk5TDI5NSwyNTdsODMsMTU4LDM0LTE5VjExOFoiLz4KICA8cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik0zNzgsOTlMMjEyLDExOCwxMjcuNSwyNTcsMjEyLDM5NmwxNjYsMTlWOTlaIi8+CiAgPHBhdGggY2xhc3M9ImNscy0zIiBkPSJNNDMsOTlMMTYsMTExVjQwM2wyNywxMkwyMTIsMjU3WiIvPgogIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTQyLjYzNyw5OC42NjdsMTY5LjU4Nyw0Ny4xMTFWMzcyLjQ0NEw0Mi42MzcsNDE1LjExMVY5OC42NjdaIi8+CiAgPHBhdGggY2xhc3M9ImNscy0zIiBkPSJNMjEyLjMxMywxNzAuNjY3bC03Mi4wMDgtMTEuNTU2LDcyLjAwOC04MS43NzgsNzEuODMsODEuNzc4WiIvPgogIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0iTTI4NC4xNDMsMTU5LjExMWwtNzEuOTE5LDExLjczMy03MS45MTktMTEuNzMzVjc3LjMzMyIvPgogIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0iTTIxMi4zMTMsMzQyLjIyMmwtNzIuMDA4LDEzLjMzNCw3Mi4wMDgsNzAuMjIyLDcxLjgzLTcwLjIyMloiLz4KICA8cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik0yMTIsMTZMMTQwLDU0VjE1OWw3Mi4yMjQtMjAuMzMzWiIvPgogIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTIxMi4yMjQsMTk2LjQ0NGwtNzEuOTE5LDcuODIzVjMwOS4xMDVsNzEuOTE5LDguMjI4VjE5Ni40NDRaIi8+CiAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMjEyLjIyNCwzNzMuMzMzTDE0MC4zMDUsMzU1LjNWNDU4LjM2M0wyMTIuMjI0LDQ5NlYzNzMuMzMzWiIvPgogIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTI4NC4xNDMsMzU1LjNsLTcxLjkxOSwxOC4wMzhWNDk2bDcxLjkxOS0zNy42MzdWMzU1LjNaIi8+CiAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMjEyLjIyNCwxOTYuNDQ0bDcxLjkxOSw3LjgyM1YzMDkuMTA1bC03MS45MTksOC4yMjhWMTk2LjQ0NFoiLz4KICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0yMTIsMTZsNzIsMzhWMTU5bC03Mi0yMFYxNloiLz4KPC9zdmc+Cg==';

export const DEFAULT_REGION = 'us-east-1';

export const AMAZON_S3_CONN_OPTIONS = {
  access_key_id: {
    display_name: 'AWS Access Key ID',
    short_desc: 'Your Amazon Access Key ID',
    desc: `This should be a severely restricted key that only has access to the specific S3 resources you want to use. We recommend you create a new user in the (IAM console)[https://console.aws.amazon.com/iam/home#users]`,
    type: 'string',
  },
  secret_access_key: {
    display_name: 'AWS Secret Access Key',
    short_desc: 'Your Amazon Secret Access Key',
    type: 'string',
  },
  region: {
    type: 'string',
    display_name: 'AWS Region',
    short_desc: 'The AWS region to use for S3 operations. Can be changed for every action',
    default_value: DEFAULT_REGION,
    allowed_values_creatable: true,
    allowed_values: AWS_REGIONS,
  },
  service: {
    type: 'string',
    default_value: 's3',
  },
} satisfies TCustomConnOptions;

export const S3_STORAGE_CLASSES = [
  { value: 'STANDARD', display_name: 'Standard' },
  { value: 'REDUCED_REDUNDANCY', display_name: 'Reduced Redundancy' },
  { value: 'STANDARD_IA', display_name: 'Standard-Infrequent Access' },
  { value: 'ONEZONE_IA', display_name: 'One Zone-Infrequent Access' },
  { value: 'INTELLIGENT_TIERING', display_name: 'Intelligent-Tiering' },
  { value: 'GLACIER', display_name: 'Glacier' },
  { value: 'DEEP_ARCHIVE', display_name: 'Glacier Deep Archive' },
  { value: 'GLACIER_IR', display_name: 'Glacier Instant Retrieval' },
];
