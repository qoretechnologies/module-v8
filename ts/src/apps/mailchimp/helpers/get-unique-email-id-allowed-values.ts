import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { MailchimpError } from '../constants';
import { fetchMailchimpData } from './constants';

type TMailchimpMember = {
  id: string;
  email_address: string;
  unique_email_id: string;
  status: string;
  merge_fields: {
    FNAME?: string;
    LNAME?: string;
    [key: string]: any;
  };
};

export const getMailchimpListUniqueEmailIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const datacenter = context?.conn_opts?.datacenter;
  const list_id = context?.opts?.list_id;

  const missingValues: string[] = [];
  if (!token) missingValues.push('token');
  if (!datacenter) missingValues.push('datacenter');
  if (!list_id) missingValues.push('list_id');

  if (missingValues.length) {
    throw new MailchimpError(
      `All of the following [${missingValues.join(', ')}] are required to get Mailchimp unique email IDs`
    );
  }

  try {
    const data = await fetchMailchimpData<{ members: TMailchimpMember[] }>({
      token: token!,
      datacenter: datacenter!,
      path: `lists/${list_id}/members`,
      params: {
        count: '100',
        fields:
          'members.id,members.email_address,members.unique_email_id,members.status,members.merge_fields',
      },
    });

    const allowedValues: IQoreAllowedValue<string>[] = (data.members || []).map((member) => {
      const firstName = member.merge_fields?.FNAME || '';
      const lastName = member.merge_fields?.LNAME || '';
      const fullName = [firstName, lastName].filter(Boolean).join(' ');

      const displayName = fullName ? `${fullName} (${member.email_address})` : member.email_address;

      return {
        display_name: displayName,
        value: member.unique_email_id,
        desc: `Email: ${member.email_address}\nStatus: ${member.status}\nMember ID: ${member.id}`,
      };
    });

    return allowedValues;
  } catch (error) {
    throw new MailchimpError(
      `Failed to get Mailchimp unique email IDs: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
