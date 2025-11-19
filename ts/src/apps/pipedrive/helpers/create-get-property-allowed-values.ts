import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { PipedriveError } from '../constants';
import { getPipedriveObjectFields } from './get-object-fields';

export const createGetPipedriveObjectPropertyAllowedValuesFunction = (
  pathToObjectFields: string,
  property: string
): TQoreGetAllowedValuesFunction<TCustomConnOptions, number> => {
  return async (context): Promise<IQoreAllowedValue<number>[]> => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: PipedriveError,
    });

    const objectFields = await getPipedriveObjectFields(token, pathToObjectFields);

    const field = objectFields.find((field) => field.key === property);

    if (!field?.options?.length) {
      throw new PipedriveError(
        `There are no ${property} options in Pipedrive ${pathToObjectFields}`
      );
    }

    return field.options.map((option) => ({
      value: option.id,
      display_name: option.label,
    }));
  };
};
