import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { FacebookAdsApi, Page, Post } from 'facebook-nodejs-business-sdk';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FacebookPagesError } from '../constants';

export const getFacebookCommentIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, page_id, post_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['page_id', 'post_id'],
    ErrorClass: FacebookPagesError,
  });

  try {
    let fb = FacebookAdsApi.init(token);
    const page = new Page(page_id);

    const pageInfo = await page.read(['id', 'name', 'access_token']);

    fb = FacebookAdsApi.init(pageInfo._data.access_token);
    const post = new Post(post_id, undefined, undefined, fb);

    const commentsResponse = await post.getComments(
      ['id', 'message', 'created_time', 'from', 'like_count', 'comment_count'],
      {
        limit: 100,
        order: 'reverse_chronological',
      }
    );

    const comments: Record<string, any>[] = commentsResponse;

    if (!comments || comments.length === 0) {
      return [];
    }

    const allowedValues: IQoreAllowedValue<string>[] = comments.map((comment: any) => {
      const commentData = comment._data || comment;
      const message = commentData.message || 'No message';
      const authorName = commentData.from?.name || 'Unknown User';
      const createdTime = commentData.created_time
        ? new Date(commentData.created_time).toLocaleString()
        : 'Unknown time';
      const likeCount = commentData.like_count || 0;
      const replyCount = commentData.comment_count || 0;

      const truncatedMessage = message.length > 80 ? message.substring(0, 80) + '...' : message;

      return {
        value: commentData.id,
        display_name: `${authorName}: ${truncatedMessage}`,
        desc:
          `Author: ${authorName}\n` +
          `Message: ${message}\n` +
          `Created: ${createdTime}\n` +
          `Likes: ${likeCount}, Replies: ${replyCount}\n` +
          `ID: ${commentData.id}`,
      };
    });

    return allowedValues;
  } catch (error) {
    throw new FacebookPagesError(`Failed to fetch comment IDs: ${error.message || error}`);
  }
};
