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
    on_change: ['refetch'],
  },
  comment_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getFacebookCommentIdAllowedValues,
    depends_on: ['page_id', 'post_id'],
  },
  message: {
    required: true,
    type: 'string',
  },
  attachment_url: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const replyToComment = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FACEBOOK_PAGES_APP_NAME,
  action: 'reply_to_comment',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, page_id, post_id, comment_id, message } = getQoreContextRequiredValues<{
      token: string;
      page_id: string;
      post_id: string;
      comment_id: string;
      message: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['page_id', 'post_id', 'comment_id', 'message'],
      connectionFields: ['token'],
      ErrorClass: FacebookPagesError,
    });

    const attachmentUrl = obj?.attachment_url;

    if (!message || message.trim().length === 0) {
      throw new FacebookPagesError('Reply message cannot be empty');
    }

    try {
      let fb = FacebookAdsApi.init(token);
      const page = new Page(page_id);

      const pageInfo = await page.read(['id', 'name', 'access_token']);

      fb = FacebookAdsApi.init(pageInfo._data.access_token);

      const parentComment = new Comment(comment_id, undefined, undefined, fb);

      const parentCommentInfo = await parentComment.read([
        'id',
        'message',
        'from',
        'created_time',
        'comment_count',
      ]);

      const replyParams: Record<string, any> = {
        message: message.trim(),
      };

      if (attachmentUrl) {
        replyParams.attachment_url = attachmentUrl;
      }

      const replyResponse = await parentComment.createComment([], replyParams);

      const replyId = replyResponse.id || replyResponse._data?.id;

      if (!replyId) {
        throw new FacebookPagesError('Failed to create reply - no reply ID returned');
      }

      const createdReply = new Comment(replyId, undefined, undefined, fb);
      const replyDetails = await createdReply.read([
        'id',
        'message',
        'created_time',
        'from',
        'like_count',
        'parent',
      ]);

      const updatedParentComment = await parentComment.read([
        'id',
        'message',
        'from',
        'created_time',
        'comment_count',
      ]);

      return {
        success: true,
        page_id,
        page_name: pageInfo._data.name,
        post_id,
        parent_comment_id: comment_id,
        parent_comment_message: parentCommentInfo._data.message || '',
        parent_comment_author: parentCommentInfo._data.from?.name || 'Unknown',
        parent_comment_replies_before: parentCommentInfo._data.comment_count || 0,
        parent_comment_replies_after: updatedParentComment._data.comment_count || 0,
        reply_id: replyId,
        reply_message: message,
        reply_details: replyDetails._data,
        reply_url: `https://facebook.com/${replyId}`,
        created_at: replyDetails._data.created_time,
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof FacebookPagesError) {
        throw error;
      }
      throw new FacebookPagesError(`Failed to reply to comment: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: {
        type: 'boolean',
        display_name: 'Success',
        short_desc: 'Whether the request was successful',
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
      parent_comment_id: {
        type: 'string',
        display_name: 'Parent Comment ID',
        short_desc: 'The ID of the comment being replied to',
      },
      parent_comment_message: {
        type: 'string',
        display_name: 'Parent Comment Message',
        short_desc: 'The text of the comment being replied to',
      },
      parent_comment_author: {
        type: 'string',
        display_name: 'Parent Comment Author',
        short_desc: 'The author of the comment being replied to',
      },
      parent_comment_replies_before: {
        type: 'integer',
        display_name: 'Parent Comment Replies Before',
        short_desc: 'Number of replies before this reply was added',
      },
      parent_comment_replies_after: {
        type: 'integer',
        display_name: 'Parent Comment Replies After',
        short_desc: 'Number of replies after this reply was added',
      },
      reply_id: {
        type: 'string',
        display_name: 'Reply ID',
        short_desc: 'The ID of the created reply',
      },
      reply_message: {
        type: 'string',
        display_name: 'Reply Message',
        short_desc: 'The text content of the reply',
      },
      reply_details: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            message: { type: 'string' },
            created_time: { type: 'string' },
            from: {
              type: {
                type: 'hash',
                fields: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
            },
            like_count: { type: 'integer' },
            parent: {
              type: {
                type: 'hash',
                fields: {
                  id: { type: 'string' },
                },
              },
            },
          },
        },
        display_name: 'Reply Details',
        short_desc: 'Complete details of the created reply',
      },
      reply_url: {
        type: 'string',
        display_name: 'Reply URL',
        short_desc: 'Direct URL to the reply on Facebook',
      },
      created_at: {
        type: 'string',
        display_name: 'Created At',
        short_desc: 'When the reply was created',
      },
      generated_at: {
        type: 'string',
        display_name: 'Generated At',
        short_desc: 'When this response was generated',
      },
    },
  },
});

export default replyToComment;
