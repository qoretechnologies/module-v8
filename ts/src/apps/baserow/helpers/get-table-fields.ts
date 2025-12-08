import {
  TQoreAnyType,
  TQoreGetDynamicTypeFunction,
  TQoreOptions,
  TQoreType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { BaserowError } from '../constants';
import { baserowApiClient } from './constants';

type TBaserowField = {
  id: number;
  name: string;
  type: string;
  primary: boolean;
  read_only: boolean;
  description: string | null;
  required?: boolean;
  text_default?: string;
  long_text_enable_rich_text?: boolean;
  number_decimal_places?: number;
  number_negative?: boolean;
  number_default?: string;
  boolean_default?: boolean;
  date_format?: string;
  date_include_time?: boolean;
  date_time_format?: string;
  duration_format?: string;
  select_options?: Array<{ id: number; value: string; color: string }>;
  single_select_default?: number;
  multiple_select_default?: number[];
  link_row_table_id?: number;
  link_row_multiple_relationships?: boolean;
  max_value?: number;
  formula_type?: string;
  array_formula_type?: string;
};

const BaserowTypeToQoreTypeMap: Record<string, TQoreType> = {
  text: 'string',
  long_text: 'string',
  number: 'number',
  boolean: 'bool',
  date: 'date',
  last_modified: 'date',
  created_on: 'date',
  url: 'string',
  email: 'string',
  phone_number: 'string',
  rating: 'integer',
  duration: 'string',
  uuid: 'string',
  autonumber: 'integer',
  password: 'string',
  formula: 'any',
  count: 'integer',
  rollup: 'any',
  single_select: 'softstring',
  multiple_select: { type: 'list', element_type: 'softstring' },
  file: { type: 'list', element_type: { type: 'hash', fields: { name: { type: 'string' } } } },
  link_row: { type: 'list', element_type: 'softstring' },
  lookup: { type: 'list', element_type: 'softstring' },
  created_by: { type: 'hash', fields: { id: { type: 'integer' }, name: { type: 'string' } } },
  multiple_collaborators: {
    type: 'list',
    element_type: { type: 'hash', fields: { id: { type: 'integer' } } },
  },
  ai: 'string',
};

export const getBaserowTableFields = async (options: {
  token: string;
  tableId: string | number;
  url: string;
}): Promise<TBaserowField[]> => {
  try {
    const { tableId, token, url } = options;

    const response = await baserowApiClient<TBaserowField[]>({
      path: `database/fields/table/${tableId}`,
      method: 'GET',
      token,
      url,
    });

    return response;
  } catch (error) {
    throw new BaserowError(`Failed to get table fields: ${error}`);
  }
};

export const getBaserowFieldIdToNameMap = async (options: {
  token: string;
  tableId: string | number;
  url: string;
}): Promise<Record<number, string>> => {
  try {
    const fields = await getBaserowTableFields(options);
    const map: Record<number, string> = {};
    fields.forEach((field) => {
      map[field.id] = field.name;
    });
    return map;
  } catch (error) {
    throw new BaserowError(`Failed to get field ID to name map: ${error}`);
  }
};

export const mapBaserowRowResponseToFieldNames = async (options: {
  token: string;
  tableId: string | number;
  url: string;
  row: Record<string, any>;
}): Promise<Record<string, any>> => {
  try {
    const { row, ...rest } = options;
    const fieldIdToNameMap = await getBaserowFieldIdToNameMap(rest);
    const mappedRow: Record<string, any> = {};

    Object.keys(row).forEach((key) => {
      if (key.startsWith('field_')) {
        const fieldId = parseInt(key.replace('field_', ''), 10);
        const fieldName = fieldIdToNameMap[fieldId];
        if (fieldName) {
          mappedRow[fieldName] = row[key];
        } else {
          mappedRow[key] = row[key];
        }
      } else {
        mappedRow[key] = row[key];
      }
    });

    return mappedRow;
  } catch (error) {
    throw new BaserowError(`Failed to map row response to field names: ${error}`);
  }
};

const getQoreTypeForBaserowField = (field: TBaserowField): TQoreType => {
  const baseType = BaserowTypeToQoreTypeMap[field.type];

  if (field.type === 'formula' || field.type === 'rollup') {
    switch (field.formula_type) {
      case 'text':
        return 'string';
      case 'number':
        return 'number';
      case 'boolean':
        return 'bool';
      case 'date':
        return 'date';
      case 'array':
        return {
          type: 'list',
          element_type: field.array_formula_type === 'text' ? 'string' : 'any',
        };
      default:
        return 'any';
    }
  }

  if (field.type === 'single_select') {
    return 'softstring';
  }

  if (field.type === 'link_row') {
    return {
      type: 'list',
      element_type: 'softstring',
    };
  }

  if (field.type === 'lookup') {
    return {
      type: 'list',
      element_type: field.array_formula_type === 'text' ? 'string' : 'any',
    };
  }

  return baseType || 'string';
};

export const getBaserowTableColumnOptions: TQoreGetDynamicTypeFunction = async (context) => {
  const { token, table, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    optionFields: ['table'],
    ErrorClass: BaserowError,
  });

  const fields = await getBaserowTableFields({ token, tableId: table, url });

  const qoreOptions: TQoreOptions = {};

  fields.forEach((field) => {
    if (field.read_only) {
      return;
    }

    let default_value = undefined;
    const type = getQoreTypeForBaserowField(field);

    if (field.text_default !== undefined) {
      default_value = field.text_default;
    } else if (field.number_default !== undefined) {
      default_value = parseFloat(field.number_default);
    } else if (field.boolean_default !== undefined) {
      default_value = field.boolean_default;
    } else if (field.single_select_default !== undefined) {
      default_value = field.single_select_default;
    } else if (field.multiple_select_default !== undefined) {
      default_value = field.multiple_select_default;
    }

    let allowed_values = undefined;
    if (field.select_options && field.select_options.length > 0) {
      allowed_values = field.select_options.map((opt) => ({
        value: opt.id,
        display_name: opt.value,
      }));
    }

    let allowedValuesFields = {};

    if (allowed_values) {
      if (field.type === 'multiple_select') {
        allowedValuesFields = {
          element_allowed_values_creatable: true,
          element_allowed_values: allowed_values,
        };
      } else if (field.type === 'single_select') {
        allowedValuesFields = {
          allowed_values_creatable: true,
          allowed_values,
        };
      }
    }

    qoreOptions[field.name] = {
      type: type as TQoreAnyType,
      display_name: field.name,
      preselected: field.primary || false,
      ...(field.description && { desc: field.description }),
      ...(default_value !== undefined && { default_value }),
      ...allowedValuesFields,
    };
  });

  return {
    type: 'hash',
    fields: qoreOptions,
  };
};

export const getBaserowTableColumnsResponseType: TQoreGetDynamicTypeFunction = async (context) => {
  const { token, table, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    optionFields: ['table'],
    ErrorClass: BaserowError,
  });

  const fields = await getBaserowTableFields({ token, tableId: table, url });

  const qoreOptions: TQoreOptions = {};

  fields.forEach((field) => {
    const type = getQoreTypeForBaserowField(field);

    qoreOptions[field.name] = {
      type: type as TQoreAnyType,
      display_name: field.name,
      required: field.primary || false,
      ...(field.description && { desc: field.description }),
    };
  });

  qoreOptions['id'] = {
    type: 'integer',
    display_name: 'Row ID',
    desc: 'Unique identifier for the row',
  };

  qoreOptions['order'] = {
    type: 'string',
    display_name: 'Order',
    desc: 'Position of the row in the table',
  };

  return {
    type: 'hash',
    fields: qoreOptions,
  };
};
