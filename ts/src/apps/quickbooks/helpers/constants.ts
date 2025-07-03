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
