import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AttioError } from '../constants';
import { fetchAttioAllowedValues } from './client';
import { TAttioTargetRecord } from './get-object-properties';

export const getReferenceAllowedValuesFunction = (
  targetObject: string
): TQoreGetAllowedValuesFunction<TCustomConnOptions, Record<string, any>> => {
  return async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: AttioError,
    });

    try {
      const allowedValues = await fetchAttioAllowedValues<TAttioTargetRecord>({
        path: `objects/${targetObject}/records/query`,
        token,
        method: 'POST',
        mapItemToAllowedValue: (item) => {
          return {
            display_name:
              item.values.name?.[0]?.value ||
              item.values.name?.[0]?.full_name ||
              item.values.record_id[0]?.value,
            value: {
              target_object: targetObject,
              target_record_id: item.values.record_id[0]?.value,
            },
          };
        },
      });

      return allowedValues.filter((value) => value.value.target_record_id);
    } catch (error) {
      if (error instanceof AttioError) {
        throw error;
      }

      throw new AttioError(
        `Failed to fetch allowed values for reference to object ${targetObject}: ${
          error?.message || error
        }`
      );
    }
  };
};
