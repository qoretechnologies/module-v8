import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ZohoCrmError } from '../constants';
import { getZohoCrmModuleFields } from './get-module-fields';
import { extractZohoCrmErrorMessage } from './extract-error';

type ItemType = {
  id: string;
  display_label: string;
  api_name: string;
};

const mapItemToAllowedValue = (item: ItemType): IQoreAllowedValue<string> => ({
  value: item.api_name,
  display_name: item.display_label,
});

export const getZohoCRMModuleFieldAllowedValues: TQoreGetAllowedValuesFunction<
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

    const fields = await getZohoCrmModuleFields({
      token,
      url,
      moduleApiName: module,
    });

    return fields.map(mapItemToAllowedValue);
  } catch (error) {
    if (error instanceof ZohoCrmError) {
      throw error;
    }

    throw new ZohoCrmError(`Failed to fetch ZohoCRM field allowed values: ${extractZohoCrmErrorMessage(error)}`);
  }
};
