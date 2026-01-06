import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { frontClient } from '../client';
import { extractFrontErrorMessage, FrontError } from '../constants';

type TFrontInbox = {
  id: string;
  name: string;
  address?: string;
  is_private?: boolean;
};

const mapItemToAllowedValue = (item: TFrontInbox): IQoreAllowedValue<string> => {
  const displayName = item.name || `Inbox #${item.id}`;
  const desc = item.address || (item.is_private ? 'Private inbox' : 'Shared inbox');

  return {
    value: item.id,
    display_name: displayName,
    desc,
  };
};

export const getFrontInboxAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    return await frontClient.fetchAllowedValues<TFrontInbox>({
      path: 'inboxes',
      token,
      mapItemToAllowedValue,
    });
  } catch (error) {
    if (error instanceof FrontError) {
      throw error;
    }

    throw new FrontError(
      `Failed to fetch Front inbox allowed values: ${extractFrontErrorMessage(error)}`
    );
  }
};
