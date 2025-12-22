import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { extractHelpScoutErrorMessage, HelpScoutError } from '../constants';
import { fetchHelpScoutAllowedValues } from './constants';

type THelpScoutFolder = {
  id: number;
  name: string;
  type: string;
  userId: number;
  totalCount: number;
  activeCount: number;
  updatedAt: string;
};

const mapItemToAllowedValue = (item: THelpScoutFolder): IQoreAllowedValue<number> => {
  return {
    value: item.id,
    display_name: item.name,
    desc: `Type: ${item.type}\nActive Count: ${item.activeCount}\nTotal Count: ${item.totalCount}`,
  };
};

export const getHelpScoutFolderAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  try {
    const { token, mailboxId } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['mailboxId'],
      ErrorClass: HelpScoutError,
    });

    return await fetchHelpScoutAllowedValues({
      token,
      method: 'GET',
      object: 'folders',
      mapItemToAllowedValue,
      path: `mailboxes/${mailboxId}/folders`,
    });
  } catch (error) {
    if (error instanceof HelpScoutError) {
      throw error;
    }

    throw new HelpScoutError(
      `Failed to fetch HelpScout folder allowed values: ${extractHelpScoutErrorMessage(error)}`
    );
  }
};
