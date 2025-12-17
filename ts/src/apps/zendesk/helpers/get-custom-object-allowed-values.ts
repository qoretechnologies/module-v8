import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { ZENDESK_CONN_OPTIONS } from '../app-constants';
import { fetchZendeskPaginatedRecords } from './constants';
import { ZendeskError } from '../constants';

type TZendeskCustomObject = {
  key: string;
  title: string;
  description?: string;
};

export const getCustomObjectAllowedValues: TQoreGetAllowedValuesFunction<
  typeof ZENDESK_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const url = context?.conn_opts?.url;

  if (!token || !url) {
    throw new ZendeskError('The token and url are required to get Zendesk custom objects');
  }

  try {
    const customObjects = await fetchZendeskPaginatedRecords<
      Record<string, any>[],
      TZendeskCustomObject
    >({
      url,
      token,
      path: 'custom_objects',
      object: 'custom_objects',
    });

    return customObjects.map((obj) => ({
      value: obj.key,
      display_name: obj.title,
      ...(obj.description && { desc: obj.description }),
    }));
  } catch (error) {
    throw new ZendeskError(`Failed to fetch custom objects: ${error}`);
  }
};
