import { ListVerifiedEmailAddressesCommand } from '@aws-sdk/client-ses';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AmazonSESError } from '../constants';
import { createSESClient } from './constants';

export const getAmazonSESVerifiedEmailAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
    context,
    connectionFields: ['access_key_id', 'secret_access_key'],
    ErrorClass: AmazonSESError,
  });

  const region = context?.opts?.region || context?.conn_opts?.region;

  try {
    const sesClient = createSESClient({
      access_key_id,
      secret_access_key,
      region,
    });

    const command = new ListVerifiedEmailAddressesCommand({});
    const response = await sesClient.send(command);

    const allowedValues: IQoreAllowedValue<string>[] = [];

    if (response.VerifiedEmailAddresses) {
      for (const email of response.VerifiedEmailAddresses) {
        if (email) {
          allowedValues.push({
            value: email,
            display_name: email,
          });
        }
      }
    }

    return allowedValues;
  } catch (error) {
    throw new AmazonSESError(`Failed to fetch verified email addresses: ${error.message || error}`);
  }
};
