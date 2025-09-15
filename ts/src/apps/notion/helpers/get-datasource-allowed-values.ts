import { DataSourceObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { delay, getQoreContextRequiredValues } from '../../../global/helpers';
import { NotionError } from '../constants';
import {
  createNotionClient,
  getNotionRickTextFieldPlainText,
  NOTION_FETCH_DELAY,
} from './constants';

export const getNotionDataSourceAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: NotionError,
  });

  try {
    const client = createNotionClient(token);
    const allDataSources: IQoreAllowedValue<string>[] = [];
    let nextCursor: string | undefined = undefined;

    do {
      const response = await client.search({
        filter: {
          property: 'object',
          value: 'data_source',
        },
        start_cursor: nextCursor,
        page_size: 100,
      });

      const dataSources = (response.results as DataSourceObjectResponse[]).filter(
        (datasource) => datasource.in_trash === false
      );

      allDataSources.push(
        ...dataSources.map((ds) => ({
          value: ds.id,
          display_name: getNotionRickTextFieldPlainText(ds.title) || `Data Source ${ds.id}`,
        }))
      );

      nextCursor = response.next_cursor || undefined;

      if (nextCursor) {
        await delay(NOTION_FETCH_DELAY);
      }
    } while (nextCursor);

    return allDataSources;
  } catch (error) {
    throw new NotionError(`Failed to fetch data sources: ${error.message || error}`);
  }
};
