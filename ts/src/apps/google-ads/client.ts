// Copyright 2026 Qore Technologies, s.r.o.
import { GoogleAdsApi } from 'google-ads-api';
import { GoogleAdsError } from './constants';

interface GoogleAdsClientConfig {
  developer_token: string;
  customer_id: string;
  login_customer_id?: string;
  client_id: string;
  client_secret: string;
  refresh_token: string;
}

export const createGoogleAdsCustomer = (config: GoogleAdsClientConfig) => {
  const { developer_token, customer_id, login_customer_id, client_id, client_secret, refresh_token } = config;

  if (!developer_token) {
    throw new GoogleAdsError('Developer token is required');
  }

  if (!customer_id) {
    throw new GoogleAdsError('Customer ID is required');
  }

  if (!client_id || !client_secret || !refresh_token) {
    throw new GoogleAdsError('OAuth2 client_id, client_secret, and refresh_token are required');
  }

  const client = new GoogleAdsApi({
    client_id,
    client_secret,
    developer_token,
  });

  return client.Customer({
    customer_id: customer_id.replace(/-/g, ''),
    refresh_token,
    ...(login_customer_id && { login_customer_id: login_customer_id.replace(/-/g, '') }),
  });
};
