import { IQoreConnectionOptions } from '../../global/models/qore';

export const SALESFORCE_CONN_OPTIONS = {
  instance_url: {
    type: 'string',
  },
} satisfies IQoreConnectionOptions;

export const SALESFORCE_API_VERSION = 'v62.0';
export const SALESFORCE_APP_NAME = 'Salesforce';
