import { Product } from '@paddle/paddle-node-sdk';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { PaddleError } from '../constants';
import { createPaddleClient } from './constants';

const mapPaddleItemToAllowedValue = (item: Product): IQoreAllowedValue<string> => ({
  value: item.id,
  display_name: item.name,
  desc: `Id: ${item.id}\nStatus: ${item.status}\nType: ${item.type}\nDescription: ${item.description}`,
  ...(item.description && { short_desc: item.description }),
  ...(item.imageUrl && { image: item.imageUrl }),
});

export const getPaddleProductIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type'],
    ErrorClass: PaddleError,
  });

  const client = createPaddleClient(token, instance_type);

  const allProducts: Product[] = [];
  const productCollection = client.products.list();

  try {
    for await (const product of productCollection) {
      allProducts.push(product);
    }
  } catch (error) {
    console.error(`Failed to fetch products: ${error}`);
  }

  return allProducts.map(mapPaddleItemToAllowedValue);
};
