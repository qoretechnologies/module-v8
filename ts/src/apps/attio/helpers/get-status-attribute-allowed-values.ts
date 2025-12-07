import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AttioError } from '../constants';
import { fetchAttioAllowedValues } from './client';

export const getStatusAttributeAllowedValuesFunction = (options: {
  type: 'lists' | 'objects';
  target: string;
  attribute: string;
}): TQoreGetAllowedValuesFunction<TCustomConnOptions, string> => {
  return async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: AttioError,
    });

    try {
      const allowedValues = await fetchAttioAllowedValues<{
        id: {
          status_id: string;
        };
        title: string;
      }>({
        path: `${options.type}/${options.target}/attributes/${options.attribute}/statuses`,
        token,
        method: 'GET',
        mapItemToAllowedValue: (item) => {
          return {
            display_name: item.title,
            value: item.id.status_id,
          };
        },
      });

      return allowedValues;
    } catch (error) {
      if (error instanceof AttioError) {
        throw error;
      }

      throw new AttioError(
        `Failed to fetch allowed values for status attribute ${options.target}: ${
          error?.message || error
        }`
      );
    }
  };
};
