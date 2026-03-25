import { PageObjectResponse } from '@notionhq/client';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { NotionError } from '../constants';
import { createNotionClient } from './constants';

export const getNotionDiscussionsAllowedValues: TQoreGetAllowedValuesFunction<
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
    const allDiscussions: IQoreAllowedValue<string>[] = [];

    const TIMEOUT_MS = 10_000;
    const startTime = Date.now();

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
    });

    for (const page of pagesResponse.results as PageObjectResponse[]) {
      if (allDiscussions.length > 0 && Date.now() - startTime >= TIMEOUT_MS) {
        Debugger.log('Discussion fetch timed out after 10s, returning partial results');
        break;
      }

      try {
        const commentsResponse = await notion.comments.list({
          block_id: page.id,
          page_size: 50,
        });

        const pageProperties = (page.properties || {}) as Record<
          string,
          { title: Array<{ plain_text: string }> }
        >;

        const pageTitle =
          pageProperties?.title?.title?.[0]?.plain_text ||
          pageProperties?.Name?.title?.[0]?.plain_text ||
          `Page ${page.id.substring(0, 8)}`;

        commentsResponse.results.forEach((comment) => {
          const createdTime = new Date(comment.created_time).toLocaleString();
          const createdBy = comment.created_by?.id || 'Unknown';

          let discussionText = '';
          if (comment.rich_text && comment.rich_text.length > 0) {
            discussionText = comment.rich_text
              .map((text: any) => text.plain_text || '')
              .join('')
              .substring(0, 100);
          }

          const displayText = discussionText || `Discussion on ${pageTitle}`;

          allDiscussions.push({
            value: comment.discussion_id,
            display_name: displayText,
            desc:
              `Page: ${pageTitle}\n` +
              `Created: ${createdTime}\n` +
              `By: ${createdBy}\n` +
              `Discussion: ${discussionText || 'No text content'}`,
          });
        });
      } catch (commentError) {
        Debugger.log(`Cannot access comments for page ${page.id}:`, commentError);
        continue;
      }
    }

    const uniqueDiscussion = Array.from(new Set(allDiscussions.map((d) => d.value))).map(
      (value) => {
        return allDiscussions.find((d) => d.value === value);
      }
    ) as IQoreAllowedValue<string>[];

    return uniqueDiscussion;
  } catch (error) {
    throw new NotionError(`Failed to fetch all discussions: ${error.message || error}`);
  }
};
