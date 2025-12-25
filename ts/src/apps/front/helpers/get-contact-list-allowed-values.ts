import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { extractFrontErrorMessage, FrontError } from '../constants';
import { fetchFrontAllowedValues } from './constants';

type TFrontContactList = {
  id: string;
  name: string;
  description?: string;
};

const mapItemToAllowedValue = (item: TFrontContactList): IQoreAllowedValue<string> => {
  const displayName = item.name || `Contact List #${item.id}`;
  const desc = item.description || 'N/A';

  return {
    value: item.id,
    display_name: displayName,
    desc,
  };
};

export const getFrontContactListAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    return await fetchFrontAllowedValues({
      token,
      method: 'GET',
      mapItemToAllowedValue,
      path: 'contact_lists',
    });
  } catch (error) {
    if (error instanceof FrontError) {
      throw error;
    }

    throw new FrontError(
      `Failed to fetch Front contact list allowed values: ${extractFrontErrorMessage(error)}`
    );
  }
};
