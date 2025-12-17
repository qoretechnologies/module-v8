import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { ZendeskError } from '../../constants';
import { fetchZendeskPaginatedRecords } from '../constants';

export const ZENDESK_SUPPORTED_TABLES = ['tickets', 'users', 'organizations'] as const;
export type TZendeskTable = (typeof ZENDESK_SUPPORTED_TABLES)[number] | string;

export const getZendeskTableList: TQoreGetTableListFunction = async (context) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: ZendeskError,
  });

  try {
    const customObjects = await fetchZendeskPaginatedRecords<
      Record<string, any>[],
      {
        key: string;
      }
    >({
      url,
      token,
      path: 'custom_objects',
      object: 'custom_objects',
    });

    const customObjectKeys = customObjects.map((obj) => obj.key);

    return [...ZENDESK_SUPPORTED_TABLES, ...customObjectKeys];
  } catch (error) {
    if (error instanceof ZendeskError) {
      throw error;
    }
    throw new ZendeskError(`Failed to fetch Zendesk table list: ${error}`);
  }
};
