// Copyright 2026 Qore Technologies, s.r.o.
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { GOOGLE_ADS_API_VERSION } from '../constants';

export const getGoogleAdsCustomerAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const token = (context as any)?.conn_opts?.token;
    const developerToken = (context as any)?.conn_opts?.developer_token;

    if (!token || !developerToken) {
      return [];
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'developer-token': developerToken,
    };

    const loginCustomerId = (context as any)?.conn_opts?.login_customer_id;
    if (loginCustomerId) {
      headers['login-customer-id'] = String(loginCustomerId).replace(/-/g, '');
    }

    const response = await fetch(
      `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers:listAccessibleCustomers`,
      { method: 'GET', headers }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const resourceNames: string[] = data.resourceNames || [];

    return resourceNames.map((resourceName): IQoreAllowedValue<string> => {
      const customerId = resourceName.replace('customers/', '');
      return {
        value: customerId,
        display_name: customerId,
      };
    });
  } catch {
    return [];
  }
};
