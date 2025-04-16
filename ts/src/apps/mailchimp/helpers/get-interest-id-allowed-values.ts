import {
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
  IQoreAllowedValue,
} from '@qoretechnologies/ts-toolkit';
import { MailchimpError } from '../constants';
import { fetchMailchimpData } from './constants';

type TMailchimpInterestCategory = {
  id: string;
  title: string;
  type: string;
  list_id: string;
};

export const getMailchimpInterestCategoryIdAllowedValues: TQoreGetAllowedValuesFunction<
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
      `All of the following [${missingValues.join(', ')}] are required to get Mailchimp interest category IDs`
    );
  }

  try {
    const data = await fetchMailchimpData<{ categories: TMailchimpInterestCategory[] }>({
      token: token!,
      datacenter: datacenter!,
      path: `lists/${list_id}/interest-categories`,
      params: {
        count: '100',
      },
    });

    const categoryTypes: Record<string, string> = {
      checkboxes: 'Checkboxes',
      dropdown: 'Dropdown',
      radio: 'Radio Buttons',
      hidden: 'Hidden',
    };

    const allowedValues: IQoreAllowedValue<string>[] = (data.categories || []).map((category) => ({
      display_name: category.title,
      value: category.id,
      desc: `Type: ${categoryTypes[category.type] || category.type}`,
    }));

    return allowedValues;
  } catch (error) {
    throw new MailchimpError(
      `Failed to get Mailchimp interest category IDs: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const getMailchimpInterestIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const datacenter = context?.conn_opts?.datacenter;
  const list_id = context?.opts?.list_id;
  const interest_category_id = context?.opts?.interest_category_id;

  const missingValues: string[] = [];
  if (!token) missingValues.push('token');
  if (!datacenter) missingValues.push('datacenter');
  if (!list_id) missingValues.push('list_id');
  if (!interest_category_id) missingValues.push('interest_category_id');

  if (missingValues.length) {
    throw new MailchimpError(
      `All of the following [${missingValues.join(', ')}] are required to get Mailchimp interest IDs`
    );
  }

  try {
    const data = await fetchMailchimpData<{
      interests: { id: string; name: string; display_order: number }[];
    }>({
      token: token!,
      datacenter: datacenter!,
      path: `lists/${list_id}/interest-categories/${interest_category_id}/interests`,
      params: {
        count: '100',
      },
    });

    const allowedValues: IQoreAllowedValue<string>[] = (data.interests || []).map((interest) => ({
      display_name: interest.name,
      value: interest.id,
      desc: `ID: ${interest.id}`,
    }));

    return allowedValues;
  } catch (error) {
    throw new MailchimpError(
      `Failed to get Mailchimp interest IDs: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
