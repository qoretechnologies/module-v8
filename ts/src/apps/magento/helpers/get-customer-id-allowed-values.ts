import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchMagentoAllowedValues } from '../../magento/helpers/constants';

type TMagentoCustomerData = {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  group_id: number;
  created_at: string;
  updated_at: string;
  addresses: {
    street: string[];
    city: string;
    region: string;
    postcode: string;
    country_id: string;
    telephone: string;
  }[];
};

const getMapMagentoCustomerFunction = (valueField: 'id' | 'email') => {
  return (customer: TMagentoCustomerData): IQoreAllowedValue<string> => ({
    display_name: `${customer.firstname} ${customer.lastname} (${customer.email})`,
    value: customer[valueField].toString(),
    desc:
      `Customer ID: ${customer.id}\n\n` +
      `Email: ${customer.email}\n\n` +
      `Group ID: ${customer.group_id}\n\n` +
      `Created: ${customer.created_at}\n\n` +
      `Updated: ${customer.updated_at}`,
  });
};

export const createMagentoCustomerAllowedValues = (
  field: 'id' | 'email'
): TQoreGetAllowedValuesFunction<TCustomConnOptions, string> => {
  return async (context): Promise<IQoreAllowedValue<string>[]> => {
    const token = context?.conn_opts?.token;
    const url = context?.conn_opts?.url;

    const missingValues: string[] = [];

    if (!url) missingValues.push('url');
    if (!token) missingValues.push('token');

    if (missingValues.length) {
      throw new Error(
        `All of the following values are required: ${missingValues.join(', ')}` +
          ` to fetch customer allowed values for Magento`
      );
    }

    const customers = await fetchMagentoAllowedValues<TMagentoCustomerData>({
      url: url!,
      token: token!,
      mapItemToAllowedValue: getMapMagentoCustomerFunction(field),
      path: '/V1/customers/search',
    });

    return customers;
  };
};

export const getMagentoCustomerIdAllowedValues = createMagentoCustomerAllowedValues('id');
export const getMagentoCustomerEmailAllowedValues = createMagentoCustomerAllowedValues('email');
