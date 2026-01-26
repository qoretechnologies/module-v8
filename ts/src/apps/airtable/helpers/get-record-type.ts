import {
  QorusRequest,
  TQoreAppActionOption,
  TQoreOptions,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { fromPairs, map } from 'lodash';
import { AIRTABLE_APP_NAME, AirtableError } from '../constants';
import { AirtableReadTypeToQoreTypeMap, AirtableWriteTypeToQoreTypeMap } from './constants';
import { getAirtableRecordAllowedValues } from './get-record-id-allowed-values';

export type TAirtableField = {
  id: string;
  name: string;
  type: string;
  options?: {
    choices?: {
      id: string;
      name?: string;
    }[];
    result?: {
      type: string;
    };
    linkedTableId?: string;
  };
};

type Table = {
  id: string;
  name: string;
  fields: TAirtableField[];
  primaryFieldId: string;
};

export const getAirtableRecordResponseType = async (options: {
  base_id: string;
  table_id: string;
  token: string;
}): Promise<TQoreTypeObject> => {
  const { base_id, table_id, token } = options;

  try {
    const response = await QorusRequest.get<{ data: { tables: Table[] } }>(
      {
        path: `/v0/meta/bases/${base_id}/tables`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      {
        url: 'https://api.airtable.com',
        endpointId: AIRTABLE_APP_NAME,
      }
    );

    const table = response?.data?.tables?.find((t: Table) => t.id === table_id);

    if (!table) {
      throw new AirtableError(`Table with ID ${table_id} not found`);
    }

    return {
      type: 'hash',
      fields: fromPairs(
        map(table.fields, (field: TAirtableField) => {
          const formulaResultType =
            field.type === 'formula' ? field.options?.result?.type || 'formula' : 'formula';
          const qoreType =
            field.type === 'formula'
              ? AirtableReadTypeToQoreTypeMap[formulaResultType]
              : AirtableReadTypeToQoreTypeMap[field.type];

          return [field.name, qoreType || 'any'];
        })
      ) as Record<string, TQoreAppActionOption>,
    };
  } catch (error) {
    if (error instanceof AirtableError) {
      throw error;
    } else {
      throw new AirtableError(`Failed to get record response type: ${error.message || error}`);
    }
  }
};

export const getAirtableRecordCreateOptions = async (options: {
  base_id: string;
  table_id: string;
  token: string;
  set_primary_required?: boolean;
}): Promise<TQoreOptions> => {
  const { base_id, table_id, token, set_primary_required = true } = options;

  try {
    const response = await QorusRequest.get<{ data: { tables: Table[] } }>(
      {
        path: `/v0/meta/bases/${base_id}/tables`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      {
        url: 'https://api.airtable.com',
        endpointId: AIRTABLE_APP_NAME,
      }
    );

    const table = response?.data?.tables?.find((t: Table) => t.id === table_id);

    if (!table) {
      throw new AirtableError(`Table with ID ${table_id} not found`);
    }

    return mapTableFieldsToOptions({
      token,
      table,
      baseId: base_id,
      setPrimaryRequired: set_primary_required,
    });
  } catch (error) {
    if (error instanceof AirtableError) {
      throw error;
    } else {
      throw new AirtableError(`Failed to get record options: ${error.message || error}`);
    }
  }
};

export const mapTableFieldsToOptions = (options: {
  table: Table;
  setPrimaryRequired?: boolean;
  token: string;
  baseId: string;
}): TQoreOptions => {
  const { table, setPrimaryRequired = false, token, baseId } = options;

  const creatableFields = table.fields.filter(
    (field: TAirtableField) => AirtableWriteTypeToQoreTypeMap[field.type]
  );

  return fromPairs(
    map(creatableFields, (field: TAirtableField) => {
      const baseType = AirtableWriteTypeToQoreTypeMap[field.type] || 'any';
      const isPrimary = field.id === table.primaryFieldId;
      const required = isPrimary && setPrimaryRequired;
      const preselected = isPrimary && !setPrimaryRequired;
      const allowed_values =
        field.options?.choices?.map((choice) => ({
          value: choice.id,
          display_name: choice.name || choice.id,
        })) || undefined;

      if (field.type === 'singleSelect' && field.options?.choices) {
        return [
          field.name,
          {
            type: baseType,
            required,
            preselected,
            ...(allowed_values && { allowed_values }),
          },
        ];
      }

      if (field.type === 'multipleSelects' && field.options?.choices) {
        return [
          field.name,
          {
            type: baseType,
            required,
            preselected,
            ...(allowed_values && { element_allowed_values: allowed_values }),
          },
        ];
      }

      if (field.type === 'multipleRecordLinks') {
        const getElementAllowedValues = field.options?.linkedTableId
          ? getAirtableRecordAllowedValues({
              conn_opts: {
                token,
              },
              opts: {
                base_id: baseId,
                table_id: field.options?.linkedTableId,
              },
            })
          : undefined;

        return [
          field.name,
          {
            required,
            preselected,
            type: {
              type: 'list',
              element_type: 'string',
            },
            ...(getElementAllowedValues && {
              get_element_allowed_values: getElementAllowedValues,
            }),
          },
        ];
      }

      return [
        field.name,
        {
          type: baseType,
          required,
          preselected,
        },
      ];
    })
  ) as TQoreOptions;
};
