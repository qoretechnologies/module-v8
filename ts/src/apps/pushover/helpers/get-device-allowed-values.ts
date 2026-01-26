
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { pushoverClient } from '../client';
import { PushoverError } from '../constants';

/**
 * Fetches available devices for a Pushover user
 * Uses the validate user endpoint to get the device list
 */
export const getPushoverDeviceAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const user = context?.conn_opts?.user;

  if (!token || !user) {
    return [];
  }

  try {
    const response = await pushoverClient.postWithAuth<{
      status: number;
      request: string;
      devices: string[];
    }>('/users/validate.json', {}, { appToken: token, userKey: user });

    const devices = response.devices || [];

    return devices.map((device) => ({
      value: device,
      display_name: device,
      short_desc: `Send to ${device} device`,
    }));
  } catch (error) {
    if (error instanceof PushoverError) {
      throw error;
    }
    throw new PushoverError(
      `Failed to fetch Pushover devices: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
