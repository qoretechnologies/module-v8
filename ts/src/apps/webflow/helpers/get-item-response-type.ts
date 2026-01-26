import { TQoreGetDynamicResponseTypeFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { getWebflowItemFields, mapWebflowFieldsToQoreOptions } from './get-item-fields';

export const getWebflowItemFieldsResponseType: TQoreGetDynamicResponseTypeFunction = async (
  context
) => {
  const { collection, token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['collection'],
  });

  const fields = await getWebflowItemFields({
    token,
    collection,
  });

  const mappedFields = mapWebflowFieldsToQoreOptions(fields, false);

  return {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      lastPublished: { type: 'string' },
      lastUpdated: { type: 'string' },
      createdOn: { type: 'string' },
      fieldData: {
        type: {
          type: 'hash',
          fields: mappedFields,
        },
      },
      cmsLocaleId: { type: 'string' },
      isArchived: { type: 'bool' },
      isDraft: { type: 'bool' },
    },
  };
};
