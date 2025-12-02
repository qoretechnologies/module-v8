import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CopperCrmError } from '../constants';
import { fetchCopperCrmAllowedValues } from './constants';

type CopperCrmUser = {
  id: number;
  name: string;
  email: string;
};

const mapUserToAllowedValue = (user: CopperCrmUser): IQoreAllowedValue<number> => ({
  value: user.id,
  display_name: user.name,
  desc: `Email: ${user.email}`,
});

export const getCopperCrmUserAllowedValues: TQoreGetAllowedValuesFunction<
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

      mapItemToAllowedValue: mapUserToAllowedValue,
      path: 'users/search',
    });
  } catch (error) {
    if (error instanceof CopperCrmError) {
      throw error;
    }

    throw new CopperCrmError(`Failed to fetch CopperCRM user allowed values: ${error}`);
  }
};
