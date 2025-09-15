import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { delay, getQoreContextRequiredValues } from '../../../global/helpers';
import { NotionError } from '../constants';
import { createNotionClient, NOTION_FETCH_DELAY } from './constants';

const MAX_ITEMS = 500;

export const getNotionDataSourceItemAllowedValues: TQoreGetAllowedValuesFunction<
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
    const allDataSourceItems: IQoreAllowedValue<string>[] = [];
    let nextCursor: string | undefined = undefined;

    do {
      const response = await client.dataSources.query({
        data_source_id,
        start_cursor: nextCursor,
        page_size: 100,
        sorts: [
          {
            direction: 'descending',
            timestamp: 'last_edited_time',
          },
        ],
      });

      const dataSourceItems = response.results;

      allDataSourceItems.push(
        ...dataSourceItems.map((item) => {
          let displayName = `Item ${item.id}`;

          if (item.object === 'page' && 'properties' in item && item.properties) {
            const titleProp =
              item.properties.title ||
              item.properties.Name ||
              item.properties.Title ||
              item.properties.name;
            if (titleProp && 'title' in titleProp && titleProp.title?.length > 0) {
              displayName = titleProp.title[0].plain_text || displayName;
            }
          }

          return {
            value: item.id,
            display_name: displayName,
          };
        })
      );

      nextCursor = response.next_cursor || undefined;

      if (nextCursor) {
        await delay(NOTION_FETCH_DELAY);
      }
    } while (nextCursor && allDataSourceItems.length < MAX_ITEMS);

    return allDataSourceItems;
  } catch (error) {
    throw new NotionError(`Failed to fetch users: ${error.message || error}`);
  }
};
