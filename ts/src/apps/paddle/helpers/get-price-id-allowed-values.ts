import { Price } from '@paddle/paddle-node-sdk';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { PaddleError } from '../constants';
import { createPaddleClient } from './constants';

const mapPaddleItemToAllowedValue = (item: Price): IQoreAllowedValue<string> => ({
  value: item.id,
  display_name: item.name || item.id,
  desc: `Id: ${item.id}\nStatus: ${item.status}\nType: ${item.type}\nDescription: ${item.description}`,
  ...(item.description && { short_desc: item.description }),
});

export const getPaddlePriceIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type'],
    ErrorClass: PaddleError,
  });

  const client = createPaddleClient(token, instance_type);

  const allPrices: Price[] = [];
  const priceCollection = client.prices.list();

  try {
    for await (const price of priceCollection) {
      allPrices.push(price);
    }
  } catch (error) {
    console.error(`Failed to fetch prices: ${error}`);
  }

  return allPrices.map(mapPaddleItemToAllowedValue);
};
