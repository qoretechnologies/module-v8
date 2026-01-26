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
  description?: string;
  plural_label: string;
  creatable: boolean;
  viewable: boolean;
  editable: boolean;
  api_name: string;
};

const convertBooleanToYesNo = (value: boolean): string => (value ? 'Yes' : 'No');

const mapItemToAllowedValue =
  (valueField: 'id' | 'api_name') =>
  (item: ItemType): IQoreAllowedValue<string> => ({
    value: item[valueField],
    display_name: item.plural_label,
    ...(item.description && { short_desc: item.description }),
    desc: `Creatable: ${convertBooleanToYesNo(item.creatable)}, Viewable: ${convertBooleanToYesNo(item.viewable)}, Editable: ${convertBooleanToYesNo(item.editable)}`,
  });

const filterItems = (item: ItemType): boolean => item.viewable && item.creatable && item.editable;

export const getZohoCRMModuleAllowedValuesFunction =
  (valueField: 'id' | 'api_name'): TQoreGetAllowedValuesFunction<TCustomConnOptions, string> =>
  async (context) => {
    try {
      const { token, url } = getQoreContextRequiredValues({
        context,
        connectionFields: ['token', 'url'],
        ErrorClass: ZohoCrmError,
      });

      return await fetchZohoCrmAllowedValues<ItemType>({
        token,
        url,
        object: 'modules',
        mapItemToAllowedValue: mapItemToAllowedValue(valueField),
        filterItems,
        path: '/settings/modules',
      });
    } catch (error) {
      if (error instanceof ZohoCrmError) {
        throw error;
      }

      throw new ZohoCrmError(
        `Failed to fetch ZohoCRM modules: ${extractZohoCrmErrorMessage(error)}`
      );
    }
  };

export const getZohoCRMModuleIdAllowedValues = getZohoCRMModuleAllowedValuesFunction('id');
export const getZohoCRMModuleApiNameAllowedValues =
  getZohoCRMModuleAllowedValuesFunction('api_name');
