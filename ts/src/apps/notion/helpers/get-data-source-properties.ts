import {
  TQoreAppActionOption,
  TQoreGetDynamicResponseTypeFunction,
  TQoreGetDynamicTypeFunction,
} from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { NotionError } from '../constants';
import {
  createNotionClient,
  DatabasePropertyConfigResponse,
  NotionFieldMapping,
} from './constants';

export const getNotionDataSourceProperties: TQoreGetDynamicTypeFunction = async (context) => {
  const { token, data_source_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['data_source_id'],
    ErrorClass: NotionError,
  });

  const fields: Record<string, TQoreAppActionOption> = {};

  try {
    const client = createNotionClient(token);

    const { properties } = await client.dataSources.retrieve({
      data_source_id,
    });

    for (const key in properties) {
      const property = properties[key];
      if (
        [
          'rollup',
          'button',
          'files',
          'verification',
          'formula',
          'unique_id',
          'relation',
          'created_by',
          'created_time',
          'last_edited_by',
          'last_edited_time',
        ].includes(property.type)
      ) {
        continue;
      }

      if (property.type === 'people') {
        const { results } = await client.users.list({ page_size: 100 });
        fields[property.name] = {
          display_name: property.name,
          required: false,
          type: {
            type: 'list',
            element_type: { type: 'string' },
          },
          element_allowed_values_creatable: true,
          element_allowed_values: results
            .filter((user) => user.type === 'person' && user.name !== null)
            .map((option: { id: string; name: string | null }) => {
              return {
                display_name: option.name || 'Unknown',
                value: option.id,
              };
            }),
        };
      } else {
        fields[property.name] = NotionFieldMapping[property.type].buildQoreType(
          property as DatabasePropertyConfigResponse
        );
      }
    }

    return { type: 'hash', fields };
  } catch (error) {
    throw new NotionError(`Failed to fetch data source properties: ${error.message || error}`);
  }
};

export const getNotionDataSourceResponseType: TQoreGetDynamicResponseTypeFunction = async (
  context
) => {
  const { token, data_source_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['data_source_id'],
    ErrorClass: NotionError,
  });

  const fields: Record<string, TQoreAppActionOption> = {};

  try {
    const client = createNotionClient(token);

    const { properties } = await client.dataSources.retrieve({
      data_source_id,
    });

    for (const key in properties) {
      const property = properties[key];
      if (
        ['rollup', 'button', 'files', 'verification', 'formula', 'unique_id', 'relation'].includes(
          property.type
        )
      ) {
        continue;
      }

      if (['people'].includes(property.type)) {
        fields[property.name] = {
          display_name: property.name,
          required: false,
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
              },
            },
          },
        };
      } else if (['created_by', 'last_edited_by'].includes(property.type)) {
        fields[property.name] = {
          display_name: property.name,
          required: false,
          type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
            },
          },
        };
      } else if (['created_time', 'last_edited_time'].includes(property.type)) {
        fields[property.name] = {
          display_name: property.name,
          required: false,
          type: 'string',
        };
      } else {
        fields[property.name] = omit(
          NotionFieldMapping[property.type].buildQoreType(
            property as DatabasePropertyConfigResponse
          ),
          ['allowed_values']
        ) as TQoreAppActionOption;
      }
    }

    return { type: 'hash', fields };
  } catch (error) {
    throw new NotionError(`Failed to fetch data source properties: ${error.message || error}`);
  }
};
