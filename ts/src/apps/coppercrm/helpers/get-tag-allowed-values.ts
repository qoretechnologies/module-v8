import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CopperCrmError } from '../constants';
import { fetchCopperCrmAllowedValues } from './constants';

type CopperCrmTag = {
  name: string;
  resource_count?: number;
};

const mapTagToAllowedValue = (tag: CopperCrmTag): IQoreAllowedValue<string> => ({
  value: tag.name,
  display_name: tag.name,
  ...(tag.resource_count !== undefined && {
    desc: `Used in ${tag.resource_count} resource${tag.resource_count !== 1 ? 's' : ''}`,
  }),
});

export const getCopperCrmTagAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  try {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: CopperCrmError,
    });

    return await fetchCopperCrmAllowedValues({
      token,
      
      method: 'GET',
      mapItemToAllowedValue: mapTagToAllowedValue,
      path: 'tags',
    });
  } catch (error) {
    if (error instanceof CopperCrmError) {
      throw error;
    }

    throw new CopperCrmError(`Failed to fetch CopperCRM tag allowed values: ${error}`);
  }
};
