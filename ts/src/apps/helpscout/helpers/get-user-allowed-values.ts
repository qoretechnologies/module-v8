import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { extractHelpScoutErrorMessage, HelpScoutError } from '../constants';
import { fetchHelpScoutAllowedValues } from './constants';

type THelpScoutUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  photoUrl?: string;
};

const mapItemToAllowedValue = (item: THelpScoutUser): IQoreAllowedValue<number> => {
  const displayName = `${item.firstName} ${item.lastName}`.trim() || item.email;
  const desc = `Email: ${item.email}\nRole: ${item.role}`;

  return {
    value: item.id,
    display_name: displayName,
    desc,
    ...(item.photoUrl && { image: item.photoUrl }),
  };
};

export const getHelpScoutUserAllowedValues: TQoreGetAllowedValuesFunction<
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
      object: 'users',
      mapItemToAllowedValue,
      path: `users`,
    });
  } catch (error) {
    if (error instanceof HelpScoutError) {
      throw error;
    }

    throw new HelpScoutError(
      `Failed to fetch HelpScout user allowed values: ${extractHelpScoutErrorMessage(error)}`
    );
  }
};
