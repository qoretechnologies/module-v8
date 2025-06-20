import { Address } from '@paddle/paddle-node-sdk';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { PaddleError } from '../constants';
import { createPaddleClient } from './constants';

const mapPaddleItemToAllowedValue = (item: Address): IQoreAllowedValue<string> => ({
  value: item.id,
  display_name: item.firstLine || `${item.city}, ${item.countryCode}`,
  desc:
    `Id: ${item.id}\n` +
    `City: ${item.city}\n` +
    `Country: ${item.countryCode}\n` +
    `Zip: ${item.postalCode}\n` +
    `First Line: ${item.firstLine}\n` +
    `Second Line: ${item.secondLine}\n`,
});

export const getPaddleCustomerAddressIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, customer_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'customer_id'],
    ErrorClass: PaddleError,
  });

  const client = createPaddleClient(token, instance_type);

  const allAddresses: Address[] = [];
  const addressCollection = client.addresses.list(customer_id);

  try {
    for await (const address of addressCollection) {
      allAddresses.push(address);
    }
  } catch (error) {
    console.error(`Failed to fetch addresses: ${error}`);
  }

  return allAddresses.map(mapPaddleItemToAllowedValue);
};
