import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CopperCrmError } from '../constants';
import { fetchCopperCrmAllowedValues } from './constants';

type CopperCrmLeadStatus = {
  id: number;
  name: string;
};

const mapLeadStatusToAllowedValue = (
  leadStatus: CopperCrmLeadStatus
): IQoreAllowedValue<number> => ({
  value: leadStatus.id,
  display_name: leadStatus.name,
});

export const getCopperCrmLeadStatusAllowedValues: TQoreGetAllowedValuesFunction<
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
      mapItemToAllowedValue: mapLeadStatusToAllowedValue,
      path: 'lead_statuses',
    });
  } catch (error) {
    if (error instanceof CopperCrmError) {
      throw error;
    }

    throw new CopperCrmError(`Failed to fetch CopperCRM lead status allowed values: ${error}`);
  }
};
