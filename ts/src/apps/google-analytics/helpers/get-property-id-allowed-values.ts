import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { GoogleAnalyticsError } from '../constants';
import { createGoogleAnalyticsAdminClient } from './constants';

export const getGoogleAnalyticsPropertyIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new GoogleAnalyticsError('Authentication token is required to get analytics properties');
  }

  try {
    const adminClient = createGoogleAnalyticsAdminClient(token);

    const [accountSummaries] = await adminClient.listAccountSummaries({});

    const allowedValues: IQoreAllowedValue<string>[] = [];

    for (const account of accountSummaries || []) {
      const accountName = account.displayName || 'Unknown Account';

      for (const property of account.propertySummaries || []) {
        if (property.property && property.displayName) {
          allowedValues.push({
            value: property.property,
            display_name: `${property.displayName} (${accountName})`,
            desc: `Property: ${property.property}\nAccount: ${accountName}`,
          });
        }
      }
    }

    return allowedValues;
  } catch (error) {
    throw new GoogleAnalyticsError(`Failed to fetch analytics properties: ${error.message || error}`);
  }
};
