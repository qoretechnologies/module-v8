import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { extractFrontErrorMessage, FrontError } from '../constants';
import { fetchFrontAllowedValues } from './constants';

type TFrontTag = {
  id: string;
  name: string;
  description?: string;
  highlight?: string;
  is_private?: boolean;
};

const mapItemToAllowedValue = (item: TFrontTag): IQoreAllowedValue<string> => {
  const displayName = item.name || `Tag #${item.id}`;
  const desc = item.description || (item.is_private ? 'Private tag' : 'Shared tag');

  return {
    value: item.id,
    display_name: displayName,
    desc,
  };
};

export const getFrontTagAllowedValues: TQoreGetAllowedValuesFunction<
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
      path: 'tags',
    });
  } catch (error) {
    if (error instanceof FrontError) {
      throw error;
    }

    throw new FrontError(
      `Failed to fetch Front tag allowed values: ${extractFrontErrorMessage(error)}`
    );
  }
};
