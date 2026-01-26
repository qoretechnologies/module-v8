import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { frontClient } from '../client';
import { extractFrontErrorMessage, FrontError } from '../constants';

type TFrontAccount = {
  id: string;
  name: string;
  description?: string;
  domains?: string[];
};

const mapItemToAllowedValue = (item: TFrontAccount): IQoreAllowedValue<string> => {
  const displayName = item.name || `Account #${item.id}`;
  const desc = item.description || (item.domains?.length ? `Domains: ${item.domains.join(', ')}` : 'N/A');

  return {
    value: item.id,
    display_name: displayName,
    desc,
  };
};

export const getFrontAccountAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    return await frontClient.fetchAllowedValues<TFrontAccount>({
      path: 'accounts',
      token,
      mapItemToAllowedValue,
    });
  } catch (error) {
    if (error instanceof FrontError) {
      throw error;
    }

    throw new FrontError(
      `Failed to fetch Front account allowed values: ${extractFrontErrorMessage(error)}`
    );
  }
};
