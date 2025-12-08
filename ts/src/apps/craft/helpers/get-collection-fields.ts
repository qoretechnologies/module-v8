import {
  IQoreAllowedValue,
  TQoreAppActionOption,
  TQoreGetDynamicTypeFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CraftError } from '../constants';
import { craftApiClient } from './constants';
import { getCraftCollectionItemAllowedValues } from './get-collection-item-allowed-values';

type TCraftCollectionFieldType =
  | 'singleSelect'
  | 'url'
  | 'number'
  | 'boolean'
  | 'text'
  | 'date'
  | 'blockLink'
  | 'email'
  | 'phone'
  | 'multiSelect'
  | 'relation';

type TCraftFieldOption = {
  name: string;
  color: string;
};

type TCraftCollectionField = {
  name: string;
  key: string;
  type: TCraftCollectionFieldType;
  options?: TCraftFieldOption[];
  targetCollectionId: string;
};

export const getCraftCollectionFields = async (options: {
  token?: string;
  collectionId: string;
  url: string;
}): Promise<Array<TCraftCollectionField>> => {
  const { token, collectionId, url } = options;

  try {
    const fields = await craftApiClient<{ properties: TCraftCollectionField[] }>({
      token,
      url,
      path: `collections/${collectionId}/schema`,
      params: {
        format: 'schema',
      },
      method: 'GET',
    });

    const properties = fields.properties || [];

    return properties;
  } catch (error) {
    throw new CraftError(`Failed to fetch Craft collection fields: ${error}`);
  }
};

const mapCraftCollectionFieldOptionToAllowedValue = (
  option: TCraftFieldOption
): IQoreAllowedValue<any> => {
  return {
    value: option.name,
    display_name: option.name,
    ...(option?.color && { short_desc: `Color: ${option.color}` }),
  };
};

export const mapCraftCollectionFieldToQoreOption = (
  customField: TCraftCollectionField,
  isForResponse = false
): TQoreAppActionOption => {
  const type = customField.type;
  const display_name = customField.name;
  const allowed_values = customField.options?.map(mapCraftCollectionFieldOptionToAllowedValue);

  switch (type) {
    case 'email':
      return {
        type: 'string',
        short_desc: 'Email address. Example: user@example.com',
        display_name,
      };
    case 'phone':
      return {
        type: 'string',
        short_desc: 'Phone number. Example: +1234567890',
        display_name,
      };
    case 'text':
      return {
        type: 'string',
        display_name,
      };
    case 'singleSelect':
      return {
        type: 'string',
        display_name,
        ...(allowed_values && !isForResponse && { allowed_values }),
      };
    case 'date':
      return {
        type: 'string',
        short_desc: 'Date in format YYYY-MM-DD. Example: 2025-12-31',
        display_name,
      };
    case 'boolean':
      return {
        type: 'bool',
        display_name,
      };
    case 'number':
      return {
        type: 'number',
        display_name,
      };
    case 'url':
      return {
        type: 'string',
        display_name,
      };
    case 'blockLink':
      return {
        type: 'string',
        display_name,
      };
    case 'multiSelect':
      return {
        type: {
          type: 'list',
          element_type: 'string',
        },
        display_name,
        ...(allowed_values && !isForResponse && { element_allowed_values: allowed_values }),
      };
    case 'relation':
      return {
        type: 'string',
        display_name,
        get_allowed_values: async (context) => {
          return await getCraftCollectionItemAllowedValues({
            ...context,
            opts: {
              collectionId: customField.targetCollectionId,
            },
          });
        },
      };
    default:
      return {
        type: 'any',
        display_name,
      };
  }
};

export const getCraftCollectionPropertiesDynamicType: TQoreGetDynamicTypeFunction = async (
  context
) => {
  const { url, collectionId } = getQoreContextRequiredValues({
    context,
    connectionFields: ['url'],
    optionFields: ['collectionId'],
    ErrorClass: CraftError,
  });

  const token = context?.conn_opts?.token;

  try {
    const customFields = await getCraftCollectionFields({
      url,
      token,
      collectionId,
    });

    const fields: Record<string, TQoreAppActionOption> = {};

    customFields.forEach((field) => {
      fields[field.key] = mapCraftCollectionFieldToQoreOption(field);
    });

    return {
      type: 'hash',
      fields,
    };
  } catch (error) {
    if (error instanceof CraftError) {
      throw error;
    }

    throw new CraftError(`Failed to fetch Craft custom field options: ${error}`);
  }
};

export const getCraftCollectionPropertiesDynamicResponseType: TQoreGetDynamicTypeFunction = async (
  context
) => {
  const { url, collectionId } = getQoreContextRequiredValues({
    context,
    connectionFields: ['url'],
    optionFields: ['collectionId'],
    ErrorClass: CraftError,
  });

  const token = context?.conn_opts?.token;

  try {
    const customFields = await getCraftCollectionFields({
      url,
      token,
      collectionId,
    });

    const fields: Record<string, TQoreAppActionOption> = {};

    customFields.forEach((field) => {
      fields[field.key] = mapCraftCollectionFieldToQoreOption(field, true);
    });

    return {
      type: 'hash',
      fields,
    };
  } catch (error) {
    if (error instanceof CraftError) {
      throw error;
    }

    throw new CraftError(`Failed to fetch Craft custom field options: ${error}`);
  }
};
