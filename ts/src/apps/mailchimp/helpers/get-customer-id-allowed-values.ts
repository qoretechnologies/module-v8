import {
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
  IQoreAllowedValue,
} from '@qoretechnologies/ts-toolkit';
import { MailchimpError } from '../constants';
import { getMailchimpAllowedValues } from './constants';

type TMailchimpCustomer = {
  id: string;
  email_address: string;
  opt_in_status: boolean;
  company?: string;
  first_name?: string;
  last_name?: string;
  orders_count: number;
  total_spent: number;
  address?: {
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    province_code?: string;
    postal_code?: string;
    country?: string;
    country_code?: string;
  };
  created_at: string;
  updated_at: string;
};

const mapMailchimpCustomerToAllowedValue = (
  item: TMailchimpCustomer
): IQoreAllowedValue<string> => {
  const fullName =
    [item.first_name, item.last_name].filter(Boolean).join(' ') || 'Unnamed Customer';
  const displayName = item.email_address ? `${fullName} (${item.email_address})` : fullName;

  return {
    display_name: displayName,
    value: item.id,
    desc:
      `ID: ${item.id}\n\n` +
      `Name: ${fullName}\n\n` +
      `Email: ${item.email_address || 'Not provided'}\n\n` +
      `Company: ${item.company || 'Not provided'}\n\n` +
      `Orders: ${item.orders_count}\n\n` +
      `Total Spent: ${item.total_spent}\n\n` +
      `Subscribed: ${item.opt_in_status ? 'Yes' : 'No'}\n\n` +
      `Created: ${item.created_at}`,
  };
};

export const getMailchimpCustomerIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;
  const datacenter = context?.conn_opts?.datacenter;
  const store_id = context?.opts?.store_id;

  const missingValues: string[] = [];
  if (!token) missingValues.push('token');
  if (!datacenter) missingValues.push('datacenter');
  if (!store_id) missingValues.push('store_id');

  if (missingValues.length) {
    throw new MailchimpError(
      `All of the following [${missingValues.join(', ')}] are required to get Mailchimp customer id allowed values`
    );
  }

  const path = `ecommerce/stores/${store_id}/customers`;

  return await getMailchimpAllowedValues({
    token: token!,
    datacenter: datacenter!,
    path,
    mapItemToAllowedValue: mapMailchimpCustomerToAllowedValue,
    dataPath: 'customers',
  });
};
