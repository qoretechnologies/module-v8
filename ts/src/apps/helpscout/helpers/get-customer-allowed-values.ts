import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { extractHelpScoutErrorMessage, HelpScoutError } from '../constants';
import { fetchHelpScoutAllowedValues } from './constants';

type THelpScoutCustomer = {
  firstName: string;
  lastName: string;
  gender: string;
  id: number;
  age: number;
  photoUrl: string;
};

const mapItemToAllowedValue = (item: THelpScoutCustomer): IQoreAllowedValue<number> => {
  const displayName = `${item.firstName} ${item.lastName}`.trim() || `Customer #${item.id}`;
  const desc = `Gender: ${item.gender || 'N/A'}\nAge: ${item.age || 'N/A'}`;

  return {
    value: item.id,
    display_name: displayName,
    desc,
    ...(item.photoUrl && { image: item.photoUrl }),
  };
};

export const getHelpScoutCustomerAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  try {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: HelpScoutError,
    });

    return await fetchHelpScoutAllowedValues({
      token,
      method: 'GET',
      object: 'customers',
      mapItemToAllowedValue,
      path: `customers`,
    });
  } catch (error) {
    if (error instanceof HelpScoutError) {
      throw error;
    }

    throw new HelpScoutError(
      `Failed to fetch HelpScout customer allowed values: ${extractHelpScoutErrorMessage(error)}`
    );
  }
};
