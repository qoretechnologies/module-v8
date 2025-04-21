import {
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
  IQoreAllowedValue,
} from '@qoretechnologies/ts-toolkit';
import { MailchimpError } from '../constants';
import { getMailchimpAllowedValues } from './constants';

type TMailchimpNote = {
  id: number;
  created_at: string;
  note: string;
  created_by: string;
};

const mapMailchimpNoteToAllowedValue = (item: TMailchimpNote): IQoreAllowedValue<number> => ({
  display_name: `Note ${item.id} - ${item.created_at}`,
  value: item.id,
  desc:
    `ID: ${item.id}\n\n` +
    `Created: ${item.created_at}\n\n` +
    `By: ${item.created_by}\n\n` +
    `Content: ${item.note}`,
});

export const getMailchimpNoteIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const token = context?.conn_opts?.token;
  const datacenter = context?.conn_opts?.datacenter;
  const list_id = context?.opts?.list_id;
  const subscriber_hash = context?.opts?.subscriber_hash;

  const missingValues: string[] = [];
  if (!token) missingValues.push('token');
  if (!datacenter) missingValues.push('datacenter');
  if (!list_id) missingValues.push('list_id');
  if (!subscriber_hash) missingValues.push('subscriber_hash');

  if (missingValues.length) {
    throw new MailchimpError(
      `All of the following [${missingValues.join(', ')}] are required to get Mailchimp note id allowed values`
    );
  }

  const path = `lists/${list_id}/members/${subscriber_hash}/notes`;

  return await getMailchimpAllowedValues({
    token: token!,
    datacenter: datacenter!,
    path,
    mapItemToAllowedValue: mapMailchimpNoteToAllowedValue,
    dataPath: 'notes',
  });
};
