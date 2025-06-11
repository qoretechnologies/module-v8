import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { Comment, FacebookAdsApi, Page } from 'facebook-nodejs-business-sdk';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FACEBOOK_PAGES_APP_NAME, FacebookPagesError } from '../constants';
import { getFacebookPageIdAllowedValues } from '../helpers/get-page-id-allowed-values';
import { getFacebookPostIdAllowedValues } from '../helpers/get-post-id-allowed-values';
import { getFacebookCommentIdAllowedValues } from '../helpers/get-comment-id-allowed-values';

const options = {
  page_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getFacebookPageIdAllowedValues,
    on_change: ['refetch'],
  },
  post_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getFacebookPostIdAllowedValues,
    depends_on: ['page_id'],
  },
  comment_id: {
    get_allowed_values: getFacebookCommentIdAllowedValues,
    required: true,
    type: 'string',
  },
  action: {
    required: false,
    type: 'string',
    default_value: 'like',

    allowed_values: [
      {
        value: 'like',
        display_name: 'Like',
        desc: 'Like the comment',
      },
      {
        value: 'unlike',
        display_name: 'Unlike',
        desc: 'Remove like from the comment',
      },
    ],
  },
} satisfies TQoreOptions;

const likeComment = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FACEBOOK_PAGES_APP_NAME,
  action: 'like_comment',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, page_id, post_id, comment_id } = getQoreContextRequiredValues<{
      token: string;
      page_id: string;
      post_id: string;
      comment_id: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['page_id', 'post_id', 'comment_id'],
      connectionFields: ['token'],
      ErrorClass: FacebookPagesError,
    });

    const action = obj?.action || 'like';

    try {
      let fb = FacebookAdsApi.init(token);
      const page = new Page(page_id);

      const pageInfo = await page.read(['id', 'name', 'access_token']);

      fb = FacebookAdsApi.init(pageInfo._data.access_token);

      const comment = new Comment(comment_id, undefined, undefined, fb);

      const commentInfo = await comment.read([
        'id',
        'message',
        'like_count',
        'user_likes',
        'from',
        'created_time',
      ]);

      const currentlyLiked = commentInfo._data.user_likes || false;
      let response;

      if (action === 'like') {
        if (currentlyLiked) {
          return {
            action: 'like',
            already_liked: true,
            page_id,
            page_name: pageInfo._data.name,
            post_id,
            comment_id,
            comment_message: commentInfo._data.message || '',
            comment_author: commentInfo._data.from?.name || 'Unknown',
            like_count: commentInfo._data.like_count || 0,
            user_likes: true,
            generated_at: new Date().toISOString(),
          };
        }

        response = await comment.createLike([]);
      } else if (action === 'unlike') {
        if (!currentlyLiked) {
          return {
            action: 'unlike',
            already_unliked: true,
            page_id,
            page_name: pageInfo._data.name,
            post_id,
            comment_id,
            comment_message: commentInfo._data.message || '',
            comment_author: commentInfo._data.from?.name || 'Unknown',
            like_count: commentInfo._data.like_count || 0,
            user_likes: false,
            generated_at: new Date().toISOString(),
          };
        }

        response = await comment.deleteLikes();
      }

      const updatedCommentInfo = await comment.read([
        'id',
        'message',
        'like_count',
        'user_likes',
        'from',
        'created_time',
      ]);

      return {
        action,
        page_id,
        page_name: pageInfo._data.name,
        post_id,
        comment_id,
        comment_message: updatedCommentInfo._data.message || '',
        comment_author: updatedCommentInfo._data.from?.name || 'Unknown',
        comment_created_time: updatedCommentInfo._data.created_time,
        like_count_before: commentInfo._data.like_count || 0,
        like_count_after: updatedCommentInfo._data.like_count || 0,
        user_likes: updatedCommentInfo._data.user_likes || false,
        response_data: response || null,
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof FacebookPagesError) {
        throw error;
      }
      throw new FacebookPagesError(`Failed to ${action} comment: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      action: {
        type: 'string',
        display_name: 'Action',
        short_desc: 'The action performed (like or unlike)',
      },
      page_id: {
        type: 'string',
        display_name: 'Page ID',
        short_desc: 'The ID of the page',
      },
      page_name: {
        type: 'string',
        display_name: 'Page Name',
        short_desc: 'The name of the page',
      },
      post_id: {
        type: 'string',
        display_name: 'Post ID',
        short_desc: 'The ID of the post',
      },
      comment_id: {
        type: 'string',
        display_name: 'Comment ID',
        short_desc: 'The ID of the comment',
      },
      comment_message: {
        type: 'string',
        display_name: 'Comment Message',
        short_desc: 'The text content of the comment',
      },
      comment_author: {
        type: 'string',
        display_name: 'Comment Author',
        short_desc: 'The name of the comment author',
      },
      comment_created_time: {
        type: 'string',
        display_name: 'Comment Created Time',
        short_desc: 'When the comment was created',
      },
      like_count_before: {
        type: 'integer',
        display_name: 'Like Count Before',
        short_desc: 'Number of likes before the action',
      },
      like_count_after: {
        type: 'integer',
        display_name: 'Like Count After',
        short_desc: 'Number of likes after the action',
      },
      user_likes: {
        type: 'boolean',
        display_name: 'User Likes',
        short_desc: 'Whether the current user likes this comment after the action',
      },
      already_liked: {
        type: 'boolean',
        display_name: 'Already Liked',
        short_desc: 'Whether the comment was already liked (when trying to like)',
      },
      already_unliked: {
        type: 'boolean',
        display_name: 'Already Unliked',
        short_desc: 'Whether the comment was already not liked (when trying to unlike)',
      },
      response_data: {
        type: {
          type: 'hash',
        },
        display_name: 'Response Data',
        short_desc: 'Raw response data from Facebook API',
      },
      generated_at: {
        type: 'string',
        display_name: 'Generated At',
        short_desc: 'When this response was generated',
      },
    },
  },
});

export default likeComment;
