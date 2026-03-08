// Copyright 2026 Qore Technologies, s.r.o.
import { TQoreAppActionFunctionContext } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { createGoogleAdsCustomer } from '../client';
import { GOOGLE_ADS_CONN_OPTIONS, GoogleAdsError } from '../constants';
import { getGoogleAdsCustomerAllowedValues } from './get-customer-allowed-values';

/** Convert a dollar amount to micros (multiply by 1,000,000) */
export const toMicros = (amount: number): number => Math.round(amount * 1_000_000);

/** Convert micros to a dollar amount (divide by 1,000,000) */
export const fromMicros = (micros: number | Long | string): number => {
  const value = typeof micros === 'string' ? parseInt(micros, 10) : Number(micros);
  return value / 1_000_000;
};

type Long = { low: number; high: number; unsigned: boolean };

/** Extract a readable error message from Google Ads API errors */
export const getGoogleAdsErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, unknown>;
    // google-ads-api throws GoogleAdsFailure protobuf objects
    if (Array.isArray(errObj.errors)) {
      const messages = errObj.errors.map((e: Record<string, unknown>) => {
        const msg = e.message || e.error_code || '';
        return typeof msg === 'object' ? JSON.stringify(msg) : String(msg);
      });
      return messages.join('; ') || JSON.stringify(error);
    }
    if (errObj.message) {
      return String(errObj.message);
    }
    return JSON.stringify(error);
  }
  return String(error);
};

/** Get an authenticated Google Ads customer client from context */
export const getGoogleAdsCustomerFromContext = (
  context: TQoreAppActionFunctionContext<typeof GOOGLE_ADS_CONN_OPTIONS>,
  optionFields: string[] = []
) => {
  const values = getQoreContextRequiredValues<{
    token: string;
    developer_token: string;
    customer_id: string;
    login_customer_id?: string;
    oauth2_client_id?: string;
    oauth2_client_secret?: string;
    oauth2_refresh_token?: string;
  }>({
    context,
    connectionFields: ['token', 'developer_token'],
    optionFields: ['customer_id', ...optionFields],
    ErrorClass: GoogleAdsError,
  });

  const connOpts = (context as any)?.conn_opts;
  const clientId = connOpts?.oauth2_client_id || '';
  const clientSecret = connOpts?.oauth2_client_secret || '';
  const refreshToken = connOpts?.oauth2_refresh_token || '';

  const customer = createGoogleAdsCustomer({
    developer_token: values.developer_token,
    customer_id: values.customer_id,
    login_customer_id: values.login_customer_id,
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  return { customer, ...values };
};

/** Shared customer_id option definition used by all actions and triggers */
export const CUSTOMER_ID_OPTION = {
  customer_id: {
    type: 'string' as const,
    required: true,
    get_allowed_values: getGoogleAdsCustomerAllowedValues,
    on_change: ['refetch' as const],
  },
};
