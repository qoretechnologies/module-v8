import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export class AmazonEC2Error extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AmazonEC2Error';
  }
}

export const AMAZON_EC2_APP_NAME = 'AmazonEC2';
export const AMAZON_EC2_APP_LOGO =
  'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPgo8c3ZnIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDE2IDE2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiPjxwYXRoIGZpbGw9IiM5RDUwMjUiIGQ9Ik0xLjcwMiAyLjk4TDEgMy4zMTJ2OS4zNzZsLjcwMi4zMzIgMi44NDItNC43NzdMMS43MDIgMi45OHoiLz48cGF0aCBmaWxsPSIjRjU4NTM2IiBkPSJNMy4zMzkgMTIuNjU3bC0xLjYzNy4zNjNWMi45OGwxLjYzNy4zNTN2OS4zMjR6Ii8+PHBhdGggZmlsbD0iIzlENTAyNSIgZD0iTTIuNDc2IDIuNjEybC44NjMtLjQwNiA0LjA5NiA2LjIxNi00LjA5NiA1LjM3Mi0uODYzLS40MDZWMi42MTJ6Ii8+PHBhdGggZmlsbD0iI0Y1ODUzNiIgZD0iTTUuMzggMTMuMjQ4bC0yLjA0MS41NDZWMi4yMDZsMi4wNC41NDh2MTAuNDk0eiIvPjxwYXRoIGZpbGw9IiM5RDUwMjUiIGQ9Ik00LjMgMS43NWwxLjA4LS41MTIgNi4wNDMgNy44NjQtNi4wNDMgNS42Ni0xLjA4LS41MTFWMS43NDl6Ii8+PHBhdGggZmlsbD0iI0Y1ODUzNiIgZD0iTTcuOTk4IDEzLjg1NmwtMi42MTguOTA2VjEuMjM4bDIuNjE4LjkwOHYxMS43MXoiLz48cGF0aCBmaWxsPSIjOUQ1MDI1IiBkPSJNNi42MDIuNjZMNy45OTggMGw2LjUzOCA4LjQ1M0w3Ljk5OCAxNmwtMS4zOTYtLjY2Vi42NnoiLz48cGF0aCBmaWxsPSIjRjU4NTM2IiBkPSJNMTUgMTIuNjg2TDcuOTk4IDE2VjBMMTUgMy4zMTR2OS4zNzJ6Ii8+PC9zdmc+';

export const DEFAULT_REGION = 'us-east-1';

export const AMAZON_EC2_CONN_OPTIONS = {
  access_key_id: {
    display_name: 'AWS Access Key ID',
    short_desc: 'Your Amazon Access Key ID',
    desc: `This should be a severely restricted key that only has access to the specific resources you want to use. We recommend you create a new user in the (IAM console)[https://console.aws.amazon.com/iam/home#users]`,
    type: 'string',
  },
  secret_access_key: {
    display_name: 'AWS Secret Access Key',
    short_desc: 'Your Amazon Secret Access Key',
    type: 'string',
  },
} satisfies TCustomConnOptions;

export const AWS_REGIONS = [
  { value: 'us-east-1', display_name: 'US East (N. Virginia)' },
  { value: 'us-east-2', display_name: 'US East (Ohio)' },
  { value: 'us-west-1', display_name: 'US West (N. California)' },
  { value: 'us-west-2', display_name: 'US West (Oregon)' },
  { value: 'ap-east-1', display_name: 'Asia Pacific (Hong Kong)' },
  { value: 'ap-south-1', display_name: 'Asia Pacific (Mumbai)' },
  { value: 'ap-northeast-1', display_name: 'Asia Pacific (Tokyo)' },
  { value: 'ap-northeast-2', display_name: 'Asia Pacific (Seoul)' },
  { value: 'ap-northeast-3', display_name: 'Asia Pacific (Osaka)' },
  { value: 'ap-southeast-1', display_name: 'Asia Pacific (Singapore)' },
  { value: 'ap-southeast-2', display_name: 'Asia Pacific (Sydney)' },
  { value: 'ca-central-1', display_name: 'Canada (Central)' },
  { value: 'eu-central-1', display_name: 'Europe (Frankfurt)' },
  { value: 'eu-west-1', display_name: 'Europe (Ireland)' },
  { value: 'eu-west-2', display_name: 'Europe (London)' },
  { value: 'eu-west-3', display_name: 'Europe (Paris)' },
  { value: 'eu-north-1', display_name: 'Europe (Stockholm)' },
  { value: 'sa-east-1', display_name: 'South America (São Paulo)' },
];
