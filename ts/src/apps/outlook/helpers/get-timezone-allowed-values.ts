import { Client } from '@microsoft/microsoft-graph-client';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

export const getOutlookTimezonesAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  const missingValues: string[] = [];

  if (!token) missingValues.push('token');

  if (missingValues.length) {
    throw new Error(
      `All of the following ${missingValues.join(', ')} are required to get Outlook timezone allowed values`
    );
  }

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token!),
    },
  });

  const allowedValues: IQoreAllowedValue<string>[] = [];

  try {
    const response = await client.api('/me/outlook/supportedTimeZones').get();

    if (response.value && Array.isArray(response.value)) {
      for (const timezone of response.value) {
        allowedValues.push({
          display_name: timezone.displayName,
          value: timezone.alias || timezone.timeZoneId,
          short_desc: `Alias: ${timezone.alias}`,
        });
      }
    }

    return allowedValues;
  } catch (error) {
    throw new Error(`Failed to fetch Outlook timezones: ${error.message}`);
  }
};
