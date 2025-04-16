import {
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
  IQoreAllowedValue,
} from '@qoretechnologies/ts-toolkit';
import { MailchimpError } from '../constants';
import { fetchMailchimpData } from './constants';

type TMailchimpTag = {
  id: number;
  name: string;
};

export const getMailchimpContactTagsAllowedValues: TQoreGetAllowedValuesFunction<
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
      `All of the following [${missingValues.join(', ')}] are required to get Mailchimp contact tags allowed values`
    );
  }

  try {
    const data = await fetchMailchimpData<{ tags: TMailchimpTag[] }>({
      token: token!,
      datacenter: datacenter!,
      path: `lists/${list_id}/tag-search`,
    });

    const allowedValues: IQoreAllowedValue<string>[] = (data.tags || []).map((tag) => ({
      display_name: tag.name,
      value: tag.name,
      desc: `Tag ID: ${tag.id}`,
    }));

    return allowedValues;
  } catch (error) {
    throw new MailchimpError(
      `Failed to get Mailchimp contact tags: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const getMailchimpSegmentTagsAllowedValues: TQoreGetAllowedValuesFunction<
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
      `All of the following [${missingValues.join(', ')}] are required to get Mailchimp segment tags allowed values`
    );
  }

  try {
    const data = await fetchMailchimpData<{ segments: any[] }>({
      token: token!,
      datacenter: datacenter!,
      path: `lists/${list_id}/segments`,
    });

    const allowedValues: IQoreAllowedValue<string>[] = (data.segments || []).map((segment) => ({
      display_name: `Segment: ${segment.name}`,
      value: segment.name,
      desc: `Segment ID: ${segment.id}\nMember count: ${segment.member_count || 0}`,
    }));

    return allowedValues;
  } catch (error) {
    throw new MailchimpError(
      `Failed to get Mailchimp segment tags: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const getMailchimpAllTagsAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const [contactTags, segmentTags] = await Promise.all([
    getMailchimpContactTagsAllowedValues(context),
    getMailchimpSegmentTagsAllowedValues(context),
  ]);

  return [...contactTags, ...segmentTags];
};
