import {
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
  IQoreAllowedValue,
} from '@qoretechnologies/ts-toolkit';
import { MailchimpError } from '../error';
import { getMailchimpAllowedValues } from './constants';

type TMailchimpSubscriber = {
  id: string;
  email_address: string;
  unique_email_id: string;
  email_type: string;
  status: string;
  merge_fields: {
    FNAME?: string;
    LNAME?: string;
    [key: string]: any;
  };
};

const mapMailchimpSubscriberToAllowedValue = (
  item: TMailchimpSubscriber
): IQoreAllowedValue<string> => ({
  display_name: item.email_address,
  value: item.id,
  desc:
    `ID: ${item.id}\n\n` +
    `Email: ${item.email_address}\n\n` +
    `Status: ${item.status}\n\n` +
    `Name: ${item.merge_fields.FNAME || ''} ${item.merge_fields.LNAME || ''}`.trim(),
});

export const getMailchimpSubscriberHashAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;
  const datacenter = context?.conn_opts?.datacenter;
  const list_id = context?.opts?.list_id;

  const missingValues: string[] = [];
  if (!token) missingValues.push('token');
  if (!datacenter) missingValues.push('datacenter');
  if (!list_id) missingValues.push('list_id');

  if (missingValues.length) {
    throw new MailchimpError(
      `All of the following [${missingValues.join(', ')}] are required to get Mailchimp subscriber hash allowed values`
    );
  }

  const path = `lists/${list_id}/members`;

  return await getMailchimpAllowedValues({
    token: token!,
    datacenter: datacenter!,
    path,
    mapItemToAllowedValue: mapMailchimpSubscriberToAllowedValue,
    dataPath: 'members',
  });
};
