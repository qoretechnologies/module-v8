import { Discount } from '@paddle/paddle-node-sdk';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { PaddleError } from '../constants';
import { createPaddleClient } from './constants';

const mapPaddleItemToAllowedValue = (item: Discount): IQoreAllowedValue<string> => ({
  value: item.id,
  display_name: item.description,
  desc:
    `Id: ${item.id}\n` +
    `Code: ${item.code || 'No Code'}\n` +
    `Type: ${item.type}\n` +
    `Amount: ${item.amount}\n`,
});

export const getPaddleDiscountIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type'],
    ErrorClass: PaddleError,
  });

  const client = createPaddleClient(token, instance_type);

  const allDiscounts: Discount[] = [];
  const discountCollection = client.discounts.list();

  try {
    for await (const discount of discountCollection) {
      allDiscounts.push(discount);
    }
  } catch (error) {
    console.error(`Failed to fetch discounts: ${error}`);
  }

  return allDiscounts.map(mapPaddleItemToAllowedValue);
};
