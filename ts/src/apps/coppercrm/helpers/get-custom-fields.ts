import {
  IQoreAllowedValue,
  TQoreAppActionOption,
  TQoreGetDynamicTypeFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, normalizeName } from '../../../global/helpers';
import { CopperCrmError } from '../constants';
import { copperCrmApiClient } from './constants';

type TCopperCrmCustomFieldType =
  | 'String'
  | 'Text'
  | 'Dropdown'
  | 'Date'
  | 'Checkbox'
  | 'Float'
  | 'URL'
  | 'Percentage'
  | 'Currency'
  | 'Connect'
  | 'MultiSelect';
type TCopperCrmAvailableOn = 'lead' | 'person' | 'company' | 'opportunity' | 'task' | 'project';
type TCopperCrmFieldOption = {
  id: number;
  name: string;
  rank: number;
};

type TCopperCrmCustomField = {
  id: number;
  name: string;
  available_on: TCopperCrmAvailableOn[];
  data_type: TCopperCrmCustomFieldType;
  is_filterable: boolean;
  currency?: string;
  options?: TCopperCrmFieldOption[];
};

export const getCopperCrmCustomFields = async (options: {
  token: string;
  availableOn?: TCopperCrmAvailableOn[];
  isFilterable?: boolean;
}): Promise<Array<TCopperCrmCustomField>> => {
  const { availableOn = [], ...requestOptions } = options;

  try {
    const fields = await copperCrmApiClient<TCopperCrmCustomField[]>({
      ...requestOptions,
      path: 'custom_field_definitions',
      method: 'GET',
    });

    let filteredFields = fields;

    if (availableOn?.length) {
      filteredFields = fields.filter((field) =>
        field.available_on.some((ao) => availableOn.includes(ao))
      );
    }

    if (options.isFilterable) {
      filteredFields = filteredFields.filter((field) => field.is_filterable);
    }

    return filteredFields;
  } catch (error) {
    throw new CopperCrmError(`Failed to fetch CopperCRM custom fields: ${error}`);
  }
};

const mapCropperCrmCustomFieldOptionToAllowedValue = (
  option: TCopperCrmFieldOption
): IQoreAllowedValue<any> => {
  return {
    value: option.id,
    display_name: option.name,
  };
};

export const mapCopperCrmCustomFieldToQoreOption = (
  customField: TCopperCrmCustomField,
  isForResponse = false
): TQoreAppActionOption => {
  const type = customField.data_type;
  const display_name = customField.name;
  const allowed_values = customField.options?.map(mapCropperCrmCustomFieldOptionToAllowedValue);

  switch (type) {
    case 'String':
      return {
        type: 'string',
        display_name,
      };
    case 'Text':
      return {
        type: 'string',
        display_name,
      };
    case 'Dropdown':
      return {
        type: 'string',
        display_name,
        ...(allowed_values && !isForResponse && { allowed_values }),
      };
    case 'Date':
      return {
        type: 'string',
        short_desc: 'Date in format MM/DD/YYYY. Example: 12/31/2025',
        display_name,
      };
    case 'Checkbox':
      return {
        type: 'bool',
        display_name,
      };
    case 'Float':
      return {
        type: 'number',
        display_name,
      };
    case 'URL':
      return {
        type: 'string',
        display_name,
      };
    case 'Percentage':
      return {
        type: 'number',
        display_name,
      };
    case 'Currency':
      return {
        type: 'number',
        display_name,
        short_desc: `Currency: ${customField.currency || 'N/A'}`,
      };
    case 'Connect':
      return {
        type: 'number',
        display_name,
      };
    case 'MultiSelect':
      return {
        type: {
          type: 'list',
          element_type: 'string',
        },
        display_name,
        ...(allowed_values && !isForResponse && { element_allowed_values: allowed_values }),
      };
    default:
      return {
        type: 'any',
        display_name,
      };
  }
};

export const getCopperCrmCustomFieldDynamicTypeFunction =
  (availableOn: TCopperCrmAvailableOn[]): TQoreGetDynamicTypeFunction =>
  async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: CopperCrmError,
    });

    try {
      const customFields = await getCopperCrmCustomFields({
        token,
        availableOn,
      });

      const fields: Record<string, TQoreAppActionOption> = {};

      customFields.forEach((field) => {
        fields[field.id] = mapCopperCrmCustomFieldToQoreOption(field);
      });

      return {
        type: 'hash',
        fields,
      };
    } catch (error) {
      if (error instanceof CopperCrmError) {
        throw error;
      }

      throw new CopperCrmError(`Failed to fetch CopperCRM custom field options: ${error}`);
    }
  };

export const getCopperCrmCustomFieldDynamicResponseTypeFunction =
  (availableOn: TCopperCrmAvailableOn[]): TQoreGetDynamicTypeFunction =>
  async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: CopperCrmError,
    });

    try {
      const customFields = await getCopperCrmCustomFields({
        token,
        availableOn,
      });

      const fields: Record<string, TQoreAppActionOption> = {};

      customFields.forEach((field) => {
        const fieldName = normalizeName(field.name);
        fields[fieldName] = mapCopperCrmCustomFieldToQoreOption(field, true);
      });

      return {
        type: 'hash',
        fields,
      };
    } catch (error) {
      if (error instanceof CopperCrmError) {
        throw error;
      }

      throw new CopperCrmError(`Failed to fetch CopperCRM custom field options: ${error}`);
    }
  };

export const getCopperCrmCustomFieldIdToFieldNameMap = async (options: {
  token: string;
}): Promise<Record<number, string>> => {
  try {
    const customFields = await getCopperCrmCustomFields(options);

    const fieldIdToNameMap: Record<number, string> = {};

    customFields.forEach((field) => {
      const fieldName = normalizeName(field.name);
      fieldIdToNameMap[field.id] = fieldName;
    });

    return fieldIdToNameMap;
  } catch (error) {
    throw new CopperCrmError(`Failed to fetch CopperCRM custom fields: ${error}`);
  }
};

export type TCopperCrmCustomFieldValue = {
  custom_field_definition_id: number;
  value: any;
};

export const mapCopperCrmCustomFieldsObjectToArray = (
  customFields: Record<string, any>
): Array<TCopperCrmCustomFieldValue> => {
  return Object.entries(customFields).map(([key, value]) => ({
    custom_field_definition_id: Number(key),
    value,
  }));
};

export const mapCopperCrmCustomFieldsResponseArrayToObject = async (options: {
  token: string;
  customFieldsArray: Array<TCopperCrmCustomFieldValue>;
}): Promise<Record<string, any>> => {
  const { token, customFieldsArray } = options;

  try {
    const fieldIdToNameMap = await getCopperCrmCustomFieldIdToFieldNameMap({
      token,
    });

    const customFieldsObject: Record<string, any> = {};

    customFieldsArray.forEach((field) => {
      const fieldName = fieldIdToNameMap[field.custom_field_definition_id];
      if (fieldName) {
        customFieldsObject[fieldName] = field.value;
      } else {
        customFieldsObject[field.custom_field_definition_id] = field.value;
      }
    });
    return customFieldsObject;
  } catch (error) {
    throw new CopperCrmError(`Failed to map CopperCRM custom fields response: ${error}`);
  }
};

export const mapCopperCrmRecordsCustomFieldsResponseArray = async (options: {
  token: string;
  records: Array<{
    [key: string]: any;
    custom_fields?: Array<TCopperCrmCustomFieldValue>;
  }>;
}): Promise<
  Array<{
    [key: string]: any;
    custom_fields?: Record<string, any>;
  }>
> => {
  const { token, records } = options;
  const fieldIdToNameMap = await getCopperCrmCustomFieldIdToFieldNameMap({
    token,
  });

  return records.map((record) => {
    const { custom_fields, ...restRecord } = record;

    if (!custom_fields) {
      return restRecord;
    }

    const formattedCustomFields: Record<string, any> = {};

    custom_fields.forEach((field) => {
      const fieldName = fieldIdToNameMap[field.custom_field_definition_id];
      if (fieldName) {
        formattedCustomFields[fieldName] = field.value;
      } else {
        formattedCustomFields[field.custom_field_definition_id] = field.value;
      }
    });

    return {
      ...restRecord,
      custom_fields: formattedCustomFields,
    };
  });
};
