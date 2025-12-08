import {
  QorusRequest,
  TCustomConnOptions,
  TQoreAnyType,
  TQoreGetAllowedValuesFunction,
  TQoreGetDynamicTypeFunction,
  TQoreOptions,
  TQoreSimpleType,
  TQoreType,
} from '@qoretechnologies/ts-toolkit';
import { TSupabaseTablesResponse } from './constants';
import { SUPABASE_APP_NAME, SupabaseError } from '../constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';

type TSupabaseField = {
  name: string;
  description: string | null;
  type?: string;
  format?: string | null;
  defaultValue: any;
  isRequired: boolean;
  isNullable: boolean;
  elementType?: string;
};

const SupabaseTypeToQoreTypeMap: Record<string, TQoreSimpleType> = {
  integer: 'integer',
  string: 'string',
  json: 'string',
  number: 'number',
  jsonb: 'string',
  boolean: 'bool',
};

const dateFormats = ['date', 'date-time', 'timestamp without time zone'];

export const getSupabaseTableFields = async (options: {
  token: string;
  projectId: string;
  tableName: string;
}): Promise<TSupabaseField[]> => {
  try {
    const { projectId, token, tableName } = options;

    const response = await QorusRequest.get<TSupabaseTablesResponse>(
      {
        path: '/rest/v1/',
        headers: {
          apikey: token,
          Authorization: `Bearer ${token}`,
        },
      },
      {
        url: `https://${projectId}.supabase.co`,
        endpointId: SUPABASE_APP_NAME,
      }
    );

    const schema = response?.data;

    if (!schema) throw new Error('No schema data received from Supabase');

    if (!schema.definitions || !schema.definitions[tableName]) {
      throw new Error(`Table '${tableName}' not found`);
    }

    const tableDefinition = schema.definitions[tableName];
    const properties = tableDefinition.properties || {};
    const required = tableDefinition.required || [];

    const columns = Object.keys(properties).map((key) => {
      const prop = properties[key];
      return {
        name: key,
        type: prop.type,
        elementType: prop.type === 'array' ? prop.items?.type || 'string' : undefined,
        format: prop.format || null,
        description: prop.description || null,
        isRequired: required.includes(key),
        defaultValue: prop.default || null,
        isNullable: !required.includes(key),
      };
    });

    return columns;
  } catch (error) {
    throw new SupabaseError(`Failed to get table fields: ${error}`);
  }
};

export const getSupabaseTableColumnOptions: TQoreGetDynamicTypeFunction = async (context) => {
  const { token, tableName, projectId } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'projectId'],
    optionFields: ['tableName'],
    ErrorClass: SupabaseError,
  });

  const fields = await getSupabaseTableFields({ token, projectId, tableName });

  const qoreOptions: TQoreOptions = {};

  fields.forEach((field) => {
    let default_value = undefined;
    let type: TQoreType = SupabaseTypeToQoreTypeMap[field.type || field.format || 'string'];

    if (field.defaultValue) {
      default_value = field.defaultValue;

      if (typeof field.defaultValue === 'string' && field.defaultValue.includes('()'))
        default_value = undefined;
    }

    if (field.type === 'array') {
      type = {
        type: 'list',
        element_type: SupabaseTypeToQoreTypeMap[field.elementType || 'string'] || 'string',
      };
    }

    if (dateFormats.includes(field.format || '')) {
      type = 'date';
    }

    qoreOptions[field.name] = {
      type,
      display_name: field.name,
      desc: field.description,
      allowed_values_creatable: true,
      preselected: field.isRequired || false,
      ...(default_value && { default_value }),
    };
  });

  return {
    type: 'hash',
    fields: qoreOptions,
  };
};

export const getSupabaseTableColumnsResponseType: TQoreGetDynamicTypeFunction = async (context) => {
  const { token, tableName, projectId } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'projectId'],
    optionFields: ['tableName'],
    ErrorClass: SupabaseError,
  });

  const fields = await getSupabaseTableFields({ token, projectId, tableName });

  const qoreOptions: TQoreOptions = {};

  fields.forEach((field) => {
    let type: TQoreType = SupabaseTypeToQoreTypeMap[field.type || field.format || 'string'];

    if (field.type === 'array') {
      type = {
        type: 'list',
        element_type: SupabaseTypeToQoreTypeMap[field.elementType || 'string'] || 'string',
      };
    }

    if (dateFormats.includes(field.format || '')) {
      type = 'date';
    }

    qoreOptions[field.name] = {
      type: type as TQoreAnyType,
      display_name: field.name,
      required: field.isRequired || false,
      ...(field.description && { desc: field.description }),
    };
  });

  return {
    type: 'hash',
    fields: qoreOptions,
  };
};

export const getSupabaseTableColumnAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, tableName, projectId } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'projectId'],
    optionFields: ['tableName'],
    ErrorClass: SupabaseError,
  });

  const fields = await getSupabaseTableFields({ token, projectId, tableName });

  const allowedValues = fields.map((field) => {
    return {
      value: field.name,
      display_name: field.name,
      ...(field.description && { desc: field.description }),
    };
  });

  return allowedValues;
};
