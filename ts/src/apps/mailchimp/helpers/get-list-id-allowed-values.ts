import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { MailchimpError } from '../error';
import { getMailchimpAllowedValues } from './constants';

type TMailchimpList = {
  id: string;
  name: string;
  list_rating: number;
  subscribe_url_short: string;
  subscribe_url_long: string;
  stats: {
    click_rate: number;
    open_rate: number;
  };
};

const mapMailchimpListToAllowedValue = (item: TMailchimpList) => ({
  display_name: item.name,
  value: item.id,
  desc:
    `ID: ${item.id}\n\n` +
    `Name: ${item.name}\n\n` +
    `Click Rate: ${item.stats.click_rate}\n\n` +
    `Open Rate: ${item.stats.open_rate}\n\n` +
    `List Rating: ${item.list_rating}`,
});

export const getMailchimpListIdAllowedValues: TQoreGetAllowedValuesFunction<
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
      `All of the following [${missingValues.join(', ')}] are required to get Mailchimp list id allowed values`
    );
  }

  const path = 'lists';

  return await getMailchimpAllowedValues<TMailchimpList, string>({
    token: token!,
    datacenter: datacenter!,
    path,
    mapItemToAllowedValue: mapMailchimpListToAllowedValue,
    dataPath: 'lists',
  });
};
