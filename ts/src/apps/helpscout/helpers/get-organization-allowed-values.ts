import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { extractHelpScoutErrorMessage, HelpScoutError } from '../constants';
import { fetchHelpScoutAllowedValues } from './constants';

type THelpScoutOrganization = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

const mapItemToAllowedValue = (item: THelpScoutOrganization): IQoreAllowedValue<number> => {
  return {
    value: item.id,
    display_name: item.name || `Organization #${item.id}`,
  };
};

export const getHelpScoutOrganizationAllowedValues: TQoreGetAllowedValuesFunction<
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
      object: 'organizations',
      mapItemToAllowedValue,
      path: `organizations`,
    });
  } catch (error) {
    if (error instanceof HelpScoutError) {
      throw error;
    }

    throw new HelpScoutError(
      `Failed to fetch HelpScout organization allowed values: ${extractHelpScoutErrorMessage(error)}`
    );
  }
};
