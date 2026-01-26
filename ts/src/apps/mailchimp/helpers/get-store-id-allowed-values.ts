import {
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
  IQoreAllowedValue,
} from '@qoretechnologies/ts-toolkit';
import { MailchimpError } from '../error';
import { getMailchimpAllowedValues } from './constants';

type TMailchimpStore = {
  id: string;
  list_id: string;
  name: string;
  platform: string;
  domain: string;
  is_syncing: boolean;
  email_address: string;
  currency_code: string;
  money_format: string;
  primary_locale: string;
  timezone: string;
  phone?: string;
  address?: {
    country: string;
    country_code: string;
    province: string;
    city: string;
    address1: string;
    address2: string;
    postal_code: string;
  };
};

const mapMailchimpStoreToAllowedValue = (item: TMailchimpStore): IQoreAllowedValue<string> => ({
  display_name: item.name,
  value: item.id,
  desc:
    `ID: ${item.id}\n\n` +
    `Name: ${item.name}\n\n` +
    `Platform: ${item.platform}\n\n` +
    `Domain: ${item.domain}\n\n` +
    `Currency: ${item.currency_code}\n\n` +
    `Email: ${item.email_address}\n\n` +
    `Syncing: ${item.is_syncing ? 'Yes' : 'No'}\n\n` +
    `Location: ${
      item.address
        ? `${item.address.city}, ${item.address.province}, ${item.address.country}`
        : 'Not specified'
    }`,
});

export const getMailchimpStoreIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;
  const datacenter = context?.conn_opts?.datacenter;

  const missingValues: string[] = [];
  if (!token) missingValues.push('token');
  if (!datacenter) missingValues.push('datacenter');

  if (missingValues.length) {
    throw new MailchimpError(
      `All of the following [${missingValues.join(', ')}] are required to get Mailchimp store id allowed values`
    );
  }

  const path = 'ecommerce/stores';

  return await getMailchimpAllowedValues({
    token: token!,
    datacenter: datacenter!,
    path,
    mapItemToAllowedValue: mapMailchimpStoreToAllowedValue,
    dataPath: 'stores',
  });
};
