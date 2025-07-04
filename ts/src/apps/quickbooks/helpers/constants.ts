import { get } from 'lodash';
import QuickBooks, { AppConfig } from 'quickbooks-node-promise';

export const createQuickbooksClient = (options: {
  realm_id: string;
  instance_type: string;
  token: string;
}) => {
  const appConfig = {
    accessToken: options.token,
    autoRefresh: false,
    debug: false,
    useProduction: options.instance_type === 'production',
  } satisfies AppConfig;

  return new QuickBooks(appConfig, options.realm_id);
};

export const QUICKBOOKS_ALLOWED_VALUES_LIMIT = 500;
export const QUICKBOOKS_ALLOWED_VALUES_TIMEOUT = 15_000; // 15 seconds

const ERROR_PATHS = {
  QB_DETAIL: 'errorResponse.Fault.Error[0].Detail',
  QB_MESSAGE: 'errorResponse.Fault.Error[0].Message',
  GENERAL_MESSAGE: 'message',
  AXIOS_MESSAGE: 'response.data.message',
} as const;

export const getQuickbooksErrorMessage = (error: any) => {
  return (
    get(error, ERROR_PATHS.QB_DETAIL) ||
    get(error, ERROR_PATHS.QB_MESSAGE) ||
    get(error, ERROR_PATHS.GENERAL_MESSAGE) ||
    String(error)
  );
};
