import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CopperCrmError } from '../constants';
import { copperCrmApiClient } from './constants';

type ItemType = {
  id: number;
  name: string;
};

const mapItemToAllowedValue = (item: ItemType): IQoreAllowedValue<number> => ({
  value: item.id,
  display_name: item.name,
});

export const getCopperCrmContactTypeAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  try {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: CopperCrmError,
    });

    const contactTypes = await copperCrmApiClient<ItemType[]>({
      path: `contact_types`,
      method: 'GET',
      token,
    });

    return contactTypes.map(mapItemToAllowedValue);
  } catch (error) {
    if (error instanceof CopperCrmError) {
      throw error;
    }

    throw new CopperCrmError(`Failed to fetch CopperCRM contact type allowed values: ${error}`);
  }
};
