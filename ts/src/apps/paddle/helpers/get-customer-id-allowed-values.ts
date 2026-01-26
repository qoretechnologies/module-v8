import { Customer } from '@paddle/paddle-node-sdk';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { PaddleError } from '../constants';
import { createPaddleClient } from './constants';

const mapPaddleItemToAllowedValue = (item: Customer): IQoreAllowedValue<string> => ({
  value: item.id,
  display_name: item.name || item.email,
  desc:
    `Id: ${item.id}\n` +
    `Status: ${item.status}\n` +
    `Email: ${item.email}\n` +
    `Locale: ${item.locale}\n` +
    `Marketing Consent: ${item.marketingConsent}`,
});

export const getPaddleCustomerIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type'],
    ErrorClass: PaddleError,
  });

  const client = createPaddleClient(token, instance_type);

  const allCustomers: Customer[] = [];
  const customerCollection = client.customers.list();

  try {
    for await (const customer of customerCollection) {
      allCustomers.push(customer);
    }
  } catch (error) {
    console.error(`Failed to fetch customers: ${error}`);
  }

  return allCustomers.map(mapPaddleItemToAllowedValue);
};
