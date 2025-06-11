import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { FacebookAdsApi, Page } from 'facebook-nodejs-business-sdk';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FacebookPagesError } from '../constants';

export const getFacebookPostIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, page_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['page_id'],
    ErrorClass: FacebookPagesError,
  });

  try {
    FacebookAdsApi.init(token);

    let page = new Page(page_id);

    const pageInfo = await page.read(['id', 'name', 'access_token']);

    const api = FacebookAdsApi.init(pageInfo._data.access_token);
    page = new Page(page_id, undefined, undefined, api);

    const posts: Record<string, any>[] = [];
    let hasMore = true;
    let cursor = null;

    do {
      const pageCursor = await page.getPosts(['id', 'message', 'created_time', 'full_picture'], {
        limit: 100,
        ...(cursor && { after: cursor }),
      });

      posts.push(...pageCursor);

      hasMore = pageCursor.hasNext();

      if (hasMore) {
        try {
          const nextBatch = await pageCursor.next();
          cursor = nextBatch.paging?.cursors?.after;
        } catch (nextError) {
          hasMore = false;
        }
      }

      if (posts.length >= 100) {
        hasMore = false;
      }
    } while (hasMore);

    const allowedValues: IQoreAllowedValue<string>[] = posts.map((post: any) => {
      const message = post.message || 'No message';
      const truncatedMessage = message.length > 50 ? message.substring(0, 50) + '...' : message;

      return {
        value: post.id,
        display_name: truncatedMessage,
        desc: `Created: ${post.created_time}\nFull message: ${message}`,
        ...(post.full_picture && { image: post.full_picture }),
      };
    });

    return allowedValues;
  } catch (error) {
    throw new FacebookPagesError(`Failed to fetch post IDs: ${error.message || error}`);
  }
};
