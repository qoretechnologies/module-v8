import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CopperCrmError } from '../constants';
import { fetchCopperCrmAllowedValues } from './constants';

type ItemType = {
  id: number;
  name: string;
  details: string;
};

const mapItemToAllowedValue = (item: ItemType): IQoreAllowedValue<number> => ({
  value: item.id,
  display_name: item.name,
  ...(item.details && { short_desc: item.details }),
});

export const getCopperCrmTaskAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  try {
    const { token, email } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'email'],
      ErrorClass: CopperCrmError,
    });

    return await fetchCopperCrmAllowedValues({
      token,
      email,
      mapItemToAllowedValue,
      path: `tasks/search`,
    });
  } catch (error) {
    if (error instanceof CopperCrmError) {
      throw error;
    }

    throw new CopperCrmError(`Failed to fetch CopperCRM task allowed values: ${error}`);
  }
};
