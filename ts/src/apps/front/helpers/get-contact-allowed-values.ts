import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { frontClient } from '../client';
import { extractFrontErrorMessage, FrontError } from '../constants';

type TFrontContact = {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
};

const mapItemToAllowedValue = (item: TFrontContact): IQoreAllowedValue<string> => {
  const displayName = item.name || `Contact #${item.id}`;
  const desc = `Description: ${item.description || 'N/A'}`;

  return {
    value: item.id,
    display_name: displayName,
    ...(desc && { desc }),
    ...(item.avatar_url && { image: item.avatar_url }),
  };
};

export const getFrontContactAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    return await frontClient.fetchAllowedValues<TFrontContact>({
      path: 'contacts',
      token,
      mapItemToAllowedValue,
    });
  } catch (error) {
    if (error instanceof FrontError) {
      throw error;
    }

    throw new FrontError(
      `Failed to fetch Front contact allowed values: ${extractFrontErrorMessage(error)}`
    );
  }
};
