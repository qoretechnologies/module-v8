import {
  QorusRequest,
  TQoreAppActionOption,
  TQoreOptions,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { fromPairs, map } from 'lodash';
import { AIRTABLE_APP_NAME, AirtableError } from '../constants';
import { AirtableReadTypeToQoreTypeMap, AirtableWriteTypeToQoreTypeMap } from './constants';

type Field = {
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
  };
};

type Table = {
  id: string;
  name: string;
  fields: Field[];
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
        map(table.fields, (field: Field) => {
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

    const creatableFields = table.fields.filter(
      (field: Field) => AirtableWriteTypeToQoreTypeMap[field.type]
    );

    return fromPairs(
      map(creatableFields, (field: Field) => {
        const baseType = AirtableWriteTypeToQoreTypeMap[field.type] || 'any';
        const isPrimary = field.id === table.primaryFieldId;
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
              required: isPrimary,
              ...(allowed_values && { allowed_values }),
            },
          ];
        }

        if (field.type === 'multipleSelects' && field.options?.choices) {
          return [
            field.name,
            {
              type: baseType,
              required: isPrimary,
              ...(allowed_values && { element_allowed_values: allowed_values }),
            },
          ];
        }

        return [
          field.name,
          {
            type: baseType,
            ...(isPrimary && set_primary_required && { required: true }),
          },
        ];
      })
    ) as TQoreOptions;
  } catch (error) {
    if (error instanceof AirtableError) {
      throw error;
    } else {
      throw new AirtableError(`Failed to get record response type: ${error.message || error}`);
    }
  }
};
