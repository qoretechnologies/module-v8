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
};

const mapItemToAllowedValue = (item: ItemType): IQoreAllowedValue<number> => ({
  value: item.id,
  display_name: item.name,
});

export const getCopperCrmCustomerSourceAllowedValues: TQoreGetAllowedValuesFunction<
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
      mapItemToAllowedValue,
      path: `customer_sources`,
    });
  } catch (error) {
    if (error instanceof CopperCrmError) {
      throw error;
    }

    throw new CopperCrmError(`Failed to fetch CopperCRM customer source allowed values: ${error}`);
  }
};
