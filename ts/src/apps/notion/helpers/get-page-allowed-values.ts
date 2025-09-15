import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { NotionError } from '../constants';
import { createNotionClient } from './constants';

export const getNotionPageAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: NotionError,
  });

  try {
    const notion = createNotionClient(token);
    const allPages: IQoreAllowedValue<string>[] = [];
    let nextCursor: string | undefined = undefined;
    let hasMore = true;

    while (hasMore && allPages.length < 1000) {
      try {
        const pagesResponse = await notion.search({
          filter: {
            property: 'object',
            value: 'page',
          },
          sort: {
            direction: 'descending',
            timestamp: 'last_edited_time',
          },
          page_size: 100,
          ...(nextCursor && { start_cursor: nextCursor }),
        });

        for (const page of pagesResponse.results as PageObjectResponse[]) {
          try {
            let pageTitle = `Page ${page.id.substring(0, 8)}`;

            if (page.properties) {
              const titleProp =
                page.properties.title ||
                page.properties.Name ||
                page.properties.Title ||
                page.properties.name;

              if (titleProp && 'title' in titleProp && titleProp.title?.length > 0) {
                pageTitle = titleProp.title[0].plain_text || pageTitle;
              }
            }

            const createdTime = new Date(page.created_time).toLocaleString();
            const lastEditedTime = new Date(page.last_edited_time).toLocaleString();

            let createdBy = 'Unknown';
            if (page.created_by?.object === 'user') {
              if ('name' in page.created_by && page.created_by.name) {
                createdBy = page.created_by.name as string;
              } else if ('id' in page.created_by) {
                createdBy = `User ${page.created_by.id.substring(0, 8)}`;
              }
            }

            const pageUrl = page.url || `https://notion.so/${page.id.replace(/-/g, '')}`;

            allPages.push({
              value: page.id,
              display_name: pageTitle,
              desc:
                `ID: ${page.id}\n` +
                `Created: ${createdTime}\n` +
                `Created by: ${createdBy}\n` +
                `Last edited: ${lastEditedTime}\n` +
                `URL: ${pageUrl}`,
            });
          } catch (pageError) {
            Debugger.log(`Error processing page ${page.id}:`, pageError);
            continue;
          }
        }

        hasMore = pagesResponse.has_more;
        nextCursor = pagesResponse.next_cursor || undefined;

        if (hasMore) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (searchError) {
        Debugger.log('Error during page search:', searchError);
        break;
      }
    }

    return allPages;
  } catch (error) {
    throw new NotionError(`Failed to fetch pages: ${error.message || error}`);
  }
};
