import { TQoreAppActionOption, TQoreGetRecordTypeFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { NotionError } from '../../constants';
import {
  createNotionClient,
  DatabasePropertyConfigResponse,
  getNotionDataSourceByTitle,
  NotionFieldMapping,
} from '../constants';

export const getNotionRecordType: TQoreGetRecordTypeFunction = async (context, tableName) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: NotionError,
  });

  const fields: Record<string, TQoreAppActionOption> = {};
  const client = createNotionClient(token);

  try {
    const { properties } = await getNotionDataSourceByTitle({ token, titleQuery: tableName });

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

    return {
      type: 'hash',
      fields: {
        ...fields,
        id: { type: 'string', required: false },
        created_time: { type: 'string', required: false },
        last_edited_time: { type: 'string', required: false },
      },
    };
  } catch (error) {
    throw new NotionError(`Failed to fetch data source record type: ${error.message || error}`);
  }
};
