import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { NotionError } from '../constants';
import { createNotionClient } from './constants';

export const getNotionDataSourcePropertiesAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, data_source_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['data_source_id'],
    ErrorClass: NotionError,
  });

  try {
    const client = createNotionClient(token);

    const response = await client.dataSources.retrieve({
      data_source_id,
    });

    return Object.keys(response.properties).map((key) => ({
      value: key,
      display_name: response.properties[key].name,
      ...(response.properties[key].description && {
        description: response.properties[key].description,
      }),
    }));
  } catch (error) {
    throw new NotionError(`Failed to fetch users: ${error.message || error}`);
  }
};
