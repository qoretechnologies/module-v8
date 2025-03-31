import { TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { MAGENTO_CONN_OPTIONS } from '../constants';
import { fetchMagentoObjectFieldsAllowedValues } from './constants';

const createGetMagentoOrderFieldsAllowedValuesFunction = (
  path: string
): TQoreGetAllowedValuesFunction<typeof MAGENTO_CONN_OPTIONS, string> => {
  return async (context) => {
    const token = context?.conn_opts?.token;
    const url = context?.conn_opts?.url;

    const missingValues: string[] = [];

    if (!url) missingValues.push('url');
    if (!token) missingValues.push('token');

    if (missingValues.length) {
      throw new Error(
        `All of the following values are required: ${missingValues.join(', ')}` +
          ` to fetch order fields allowed values for Magento`
      );
    }

    return await fetchMagentoObjectFieldsAllowedValues({
      path,
      url: url!,
      token: token!,
    });
  };
};

export const getMagentoOrderFieldsAllowedValues =
  createGetMagentoOrderFieldsAllowedValuesFunction('/V1/orders');

export const getMagentoReturnFieldsAllowedValues =
  createGetMagentoOrderFieldsAllowedValuesFunction('/V1/returns');

export const getMagentoInvoiceFieldsAllowedValues =
  createGetMagentoOrderFieldsAllowedValuesFunction('/V1/invoices');

export const getMagentoShipmentFieldsAllowedValues =
  createGetMagentoOrderFieldsAllowedValuesFunction('/V1/shipments');

export const getMagentoTransactionFieldsAllowedValues =
  createGetMagentoOrderFieldsAllowedValuesFunction('/V1/transactions');

export const getMagentoCustomerFieldsAllowedValues =
  createGetMagentoOrderFieldsAllowedValuesFunction('/V1/customers');

export const getMagentoProductFieldsAllowedValues =
  createGetMagentoOrderFieldsAllowedValuesFunction('/V1/products');

export const getMagentoCartFieldsAllowedValues =
  createGetMagentoOrderFieldsAllowedValuesFunction('/V1/carts');
