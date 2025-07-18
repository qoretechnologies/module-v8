import { TQoreGetDependentOptionsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { getWebflowItemFields, mapWebflowFieldsToQoreOptions } from './get-item-fields';

export const createWebflowDependentOptionsFunction = (
  markRequired: boolean
): TQoreGetDependentOptionsFunction => {
  return async (context) => {
    const { collection, token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['collection'],
    });

    const fields = await getWebflowItemFields({
      token,
      collection,
    });

    return mapWebflowFieldsToQoreOptions(fields, markRequired);
  };
};

export const getWebflowItemUpdateOptions = createWebflowDependentOptionsFunction(false);
export const getWebflowItemCreationOptions = createWebflowDependentOptionsFunction(true);
