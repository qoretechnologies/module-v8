import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchMagentoAllowedValues } from '../../magento/helpers/constants';

type TMagentoProductData = {
  id: string;
  sku: string;
  name: string;
  price: number;
  status: number;
  type_id: string;
  created_at: string;
  updated_at: string;
  weight: number;
  extension_attributes: {
    stock_item: {
      qty: number;
      is_in_stock: boolean;
    };
  };
  custom_attributes: {
    attribute_code: string;
    value: string;
  }[];
};

type TValueType = 'string' | 'object';

const createProductMapper = (valueType: TValueType = 'string') => {
  return (product: TMagentoProductData): IQoreAllowedValue<any> => {
    const getAttributeValue = (code: string) => {
      const attr = product.custom_attributes?.find((a) => a.attribute_code === code);

      return attr ? attr.value : '';
    };

    return {
      display_name: `${product.name} (${product.sku})`,
      value: valueType === 'string' ? product.sku : { sku: product.sku },
      desc:
        `SKU: ${product.sku}\n\n` +
        `Type: ${product.type_id}\n\n` +
        `Price: $${product.price}\n\n` +
        `Status: ${product.status === 1 ? 'Enabled' : 'Disabled'}\n\n` +
        `Created: ${product.created_at}\n\n` +
        `Updated: ${product.updated_at}\n\n` +
        `Description: ${getAttributeValue('description')}`,
    };
  };
};

const createGetMagentoProductSkuAllowedValuesFunction = (
  valueType: TValueType = 'string'
): TQoreGetAllowedValuesFunction<TCustomConnOptions> => {
  return async (context): Promise<IQoreAllowedValue<any>[]> => {
    const token = context?.conn_opts?.token;
    const url = context?.conn_opts?.url;

    const missingValues: string[] = [];

    if (!url) missingValues.push('url');
    if (!token) missingValues.push('token');

    if (missingValues.length) {
      throw new Error(
        `All of the following values are required: ${missingValues.join(', ')}` +
          ` to fetch product allowed values for Magento`
      );
    }

    const products = await fetchMagentoAllowedValues<TMagentoProductData>({
      url: url!,
      token: token!,
      mapItemToAllowedValue: createProductMapper(valueType),
      path: '/V1/products',
    });

    return products;
  };
};

export const getMagentoProductSkuAllowedValues =
  createGetMagentoProductSkuAllowedValuesFunction('string');

export const getMagentoProductSkuObjectAllowedValues =
  createGetMagentoProductSkuAllowedValuesFunction('object');
