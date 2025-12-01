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

export const getCopperCrmLossReasonAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  try {
    const { token, email } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'email'],
      ErrorClass: CopperCrmError,
    });

    const lossReasons = await copperCrmApiClient<ItemType[]>({
      path: `loss_reasons`,
      method: 'GET',
      token,
      email,
    });

    return lossReasons.map(mapItemToAllowedValue);
  } catch (error) {
    if (error instanceof CopperCrmError) {
      throw error;
    }

    throw new CopperCrmError(`Failed to fetch CopperCRM loss reason allowed values: ${error}`);
  }
};
