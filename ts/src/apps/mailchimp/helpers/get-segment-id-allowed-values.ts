import {
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
  IQoreAllowedValue,
} from '@qoretechnologies/ts-toolkit';
import { MailchimpError } from '../error';
import { getMailchimpAllowedValues } from './constants';

type TMailchimpSegment = {
  id: number;
  name: string;
  member_count: number;
  type: string;
  created_at: string;
  updated_at: string;
  options?: {
    match?: string;
    conditions?: Array<{
      field: string;
      op: string;
      value: string;
    }>;
  };
};

const mapMailchimpSegmentToAllowedValue = (item: TMailchimpSegment): IQoreAllowedValue<number> => ({
  display_name: item.name,
  value: item.id,
  desc:
    `ID: ${item.id}\n\n` +
    `Name: ${item.name}\n\n` +
    `Type: ${item.type}\n\n` +
    `Members: ${item.member_count}\n\n` +
    `Created: ${item.created_at}\n\n` +
    `Updated: ${item.updated_at}\n\n` +
    (item.options?.match ? `Match: ${item.options.match}\n\n` : '') +
    (item.options?.conditions && item.options.conditions.length > 0
      ? `Conditions: ${item.options.conditions
          .map((c) => `${c.field} ${c.op} ${c.value}`)
          .join(', ')}`
      : ''),
});

export const getMailchimpSegmentIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const token = context?.conn_opts?.token;
  const datacenter = context?.conn_opts?.datacenter;
  const list_id = context?.opts?.list_id || context?.opts?.recipients?.list_id;

  const missingValues: string[] = [];
  if (!token) missingValues.push('token');
  if (!datacenter) missingValues.push('datacenter');
  if (!list_id) missingValues.push('list_id');

  if (missingValues.length) {
    throw new MailchimpError(
      `All of the following [${missingValues.join(', ')}] are required to get Mailchimp segment id allowed values`
    );
  }

  const path = `lists/${list_id}/segments`;

  return await getMailchimpAllowedValues({
    token: token!,
    datacenter: datacenter!,
    path,
    mapItemToAllowedValue: mapMailchimpSegmentToAllowedValue,
    dataPath: 'segments',
  });
};
