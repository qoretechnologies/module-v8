import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GoogleTasksError } from '../constants';
import { createGoogleTasksClient } from './constants';

export const getGoogleTasksListAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: GoogleTasksError,
  });

  const client = createGoogleTasksClient(token);
  try {
    const response = await client.tasklists.list({
      maxResults: 1000,
    });

    const allowedValues: IQoreAllowedValue<string>[] =
      response.data.items?.map((item) => {
        return {
          value: item.id!,
          display_name: item.title || 'No title',
        };
      }) || [];

    return allowedValues;
  } catch (error) {
    throw new GoogleTasksError(`Failed to fetch task lists: ${error.message || error}`);
  }
};
