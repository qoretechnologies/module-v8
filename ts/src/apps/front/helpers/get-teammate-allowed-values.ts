import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { frontClient } from '../client';
import { extractFrontErrorMessage, FrontError } from '../constants';

type TFrontTeammate = {
  id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_available?: boolean;
};

const mapItemToAllowedValue = (item: TFrontTeammate): IQoreAllowedValue<string> => {
  const name = [item.first_name, item.last_name].filter(Boolean).join(' ');
  const displayName = name || item.username || item.email || `Teammate #${item.id}`;
  const desc = item.email || 'N/A';

  return {
    value: item.id,
    display_name: displayName,
    desc,
  };
};

export const getFrontTeammateAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    return await frontClient.fetchAllowedValues<TFrontTeammate>({
      path: 'teammates',
      token,
      mapItemToAllowedValue,
    });
  } catch (error) {
    if (error instanceof FrontError) {
      throw error;
    }

    throw new FrontError(
      `Failed to fetch Front teammate allowed values: ${extractFrontErrorMessage(error)}`
    );
  }
};
