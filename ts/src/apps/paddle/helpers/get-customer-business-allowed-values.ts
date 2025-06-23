import { Business } from '@paddle/paddle-node-sdk';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { PaddleError } from '../constants';
import { createPaddleClient } from './constants';

const mapPaddleItemToAllowedValue = (item: Business): IQoreAllowedValue<string> => ({
  value: item.id,
  display_name: item.name,
  desc: `Id: ${item.id}\nStatus: ${item.status}\nCompany Number: ${item.companyNumber}\n`,
});

export const getPaddleCustomerBusinessIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, customer_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'customer_id'],
    ErrorClass: PaddleError,
  });

  const client = createPaddleClient(token, instance_type);

  const allBusinesses: Business[] = [];
  const businessCollection = client.businesses.list(customer_id);

  try {
    for await (const business of businessCollection) {
      allBusinesses.push(business);
    }
  } catch (error) {
    console.error(`Failed to fetch businesses: ${error}`);
  }

  return allBusinesses.map(mapPaddleItemToAllowedValue);
};
