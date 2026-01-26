import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ZohoCrmError } from '../constants';
import { fetchZohoCrmAllowedValues } from './constants';
import { extractZohoCrmErrorMessage } from './extract-error';

type ItemType = {
  id: string;
  name: string;
};

const mapItemToAllowedValue = (item: ItemType): IQoreAllowedValue<string> => ({
  value: item.id,
  display_name: item.name,
});

export const getZohoCRMTagsAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { token, url, module } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      optionFields: ['module'],
      ErrorClass: ZohoCrmError,
    });

    return await fetchZohoCrmAllowedValues({
      token,
      url,
      method: 'GET',
      object: 'tags',
      mapItemToAllowedValue,
      path: `settings/tags`,
      params: {
        module,
      },
    });
  } catch (error) {
    if (error instanceof ZohoCrmError) {
      throw error;
    }

    throw new ZohoCrmError(`Failed to fetch ZohoCRM tag allowed values: ${extractZohoCrmErrorMessage(error)}`);
  }
};
