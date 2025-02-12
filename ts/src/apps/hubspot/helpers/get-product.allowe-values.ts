import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchHubspotAllowedValues } from './constants';

type THubspotProduct = {
  id: string;
  properties: {
    name: string;
    price: string;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
};

const mapHubspotProduct = (product: THubspotProduct): IQoreAllowedValue<string> => ({
  value: product.id,
  display_name: product.properties.name,
  desc:
    `Price: ${product.properties.price}\n\nArchived: ${product.archived}\n\n` +
    `Created at: ${product.createdAt}\n\nUpdated at: ${product.updatedAt}`,
});

export const getHubspotProductAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Hubspot product allowed values');
  }

  const products = await fetchHubspotAllowedValues<THubspotProduct>({
    token,
    object: 'products',
    mapItemToAllowedValue: mapHubspotProduct,
  });

  return products;
};
