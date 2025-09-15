import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { FacebookAdsApi, Page, Post, Comment } from 'facebook-nodejs-business-sdk';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FACEBOOK_PAGES_APP_NAME, FacebookPagesError } from '../constants';
import { getFacebookPageIdAllowedValues } from '../helpers/get-page-id-allowed-values';
import { getFacebookPostIdAllowedValues } from '../helpers/get-post-id-allowed-values';
import { FacebookCommentFieldsAllowedValues } from '../helpers/get-comment-fields-allowed-values';

const options = {
  page_id: {
    required: true,
    type: 'string',
    get_allowed_values: getFacebookPageIdAllowedValues,
    on_change: ['refetch'],
  },
  post_id: {
    required: true,
    type: 'string',
    get_allowed_values: getFacebookPostIdAllowedValues,
    depends_on: ['page_id'],
  },
  fields: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    default_value: ['id', 'message', 'created_time', 'from', 'like_count', 'comment_count'],
    element_allowed_values: FacebookCommentFieldsAllowedValues,
  },
  limit: {
    required: false,
    type: 'integer',
    default_value: 25,
  },
  order: {
    required: false,
    type: 'string',
    default_value: 'chronological',
    allowed_values: [
      {
        value: 'chronological',
        display_name: 'Chronological',
        desc: 'Order comments by time posted (oldest first)',
      },
      {
        value: 'reverse_chronological',
        display_name: 'Reverse Chronological',
        desc: 'Order comments by time posted (newest first)',
      },
    ],
  },
  filter: {
    required: false,
    type: 'string',
    default_value: 'toplevel',
    allowed_values: [
      {
        value: 'toplevel',
        display_name: 'Top Level',
        desc: 'Only top-level comments (no replies)',
      },
      {
        value: 'stream',
        display_name: 'Stream',
        desc: 'All comments including replies in chronological order',
      },
    ],
  },
  include_replies: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
} satisfies TQoreOptions;

const getPostComments = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FACEBOOK_PAGES_APP_NAME,
  action: 'get_post_comments',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, page_id, post_id } = getQoreContextRequiredValues<{
      token: string;
      page_id: string;
      post_id: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['page_id', 'post_id'],
      connectionFields: ['token'],
      ErrorClass: FacebookPagesError,
    });

    const fields = obj?.fields || [
      'id',
      'message',
      'created_time',
      'from',
      'like_count',
      'comment_count',
    ];
    const limit = obj?.limit || 25;
    const order = obj?.order || 'chronological';
    const filter = obj?.filter || 'toplevel';
    const includeReplies = obj?.include_replies || false;

    if (limit > 100) {
      throw new FacebookPagesError('Limit cannot exceed 100 comments');
    }

    try {
      let fb = FacebookAdsApi.init(token);
      const page = new Page(page_id);

      const pageInfo = await page.read(['id', 'name', 'access_token']);

      fb = FacebookAdsApi.init(pageInfo._data.access_token);
      const post = new Post(post_id, undefined, undefined, fb);

      const postInfo = await post.read(['id', 'message', 'created_time']);

      const params: Record<string, any> = {
        limit,
        order,
        filter,
        fields: fields.join(','),
      };

      const commentsResponse = await post.getComments(fields, params);

      const comments: Record<string, any>[] = commentsResponse;

      if (includeReplies && filter === 'toplevel') {
        for (const comment of comments) {
          try {
            const commentObj = new Comment(comment.id, undefined, undefined, fb);
            const replies = await commentObj.getComments(
              ['id', 'message', 'created_time', 'from', 'like_count'],
              {
                limit: 10,
              }
            );
            comment._data.replies = replies.map((reply: any) => reply._data);
            comment._data.replies_count = replies.length;
          } catch (replyError) {
            comment._data.replies = [];
            comment._data.replies_count = 0;
          }
        }
      }

      const formattedComments = comments.map((comment: any) => {
        const formattedComment: Record<string, any> = { ...comment._data };

        if (formattedComment.from) {
          formattedComment.author = {
            id: formattedComment.from.id,
            name: formattedComment.from.name,
          };
          delete formattedComment.from;
        }

        if (formattedComment.attachment) {
          formattedComment.has_attachment = true;
          formattedComment.attachment_type = formattedComment.attachment.type || 'unknown';
        } else {
          formattedComment.has_attachment = false;
        }

        return formattedComment;
      });

      const cursors = commentsResponse.paging?.cursors;

      return {
        page_id,
        page_name: pageInfo._data.name,
        post_id,
        post_message: postInfo._data.message || '',
        total_comments: formattedComments.length,
        comments: formattedComments,
        search_criteria: {
          limit,
          order,
          filter,
          include_replies: includeReplies,
          fields_requested: fields,
        },
        cursors,
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof FacebookPagesError) {
        throw error;
      }
      throw new FacebookPagesError(`Failed to get post comments: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
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
      post_message: {
        type: 'string',
        display_name: 'Post Message',
        short_desc: 'The message content of the post',
      },
      total_comments: {
        type: 'integer',
        display_name: 'Total Comments',
        short_desc: 'The total number of comments retrieved',
      },
      comments: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              message: { type: 'string' },
              created_time: { type: 'string' },
              author: {
                type: {
                  type: 'hash',
                  fields: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
              like_count: { type: 'integer' },
              comment_count: { type: 'integer' },
              parent: {
                type: {
                  type: 'hash',
                  fields: {
                    id: { type: 'string' },
                  },
                },
              },
              has_attachment: { type: 'boolean' },
              attachment_type: { type: 'string' },
              replies: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      id: { type: 'string' },
                      message: { type: 'string' },
                      created_time: { type: 'string' },
                      author: {
                        type: {
                          type: 'hash',
                          fields: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                          },
                        },
                      },
                      like_count: { type: 'integer' },
                    },
                  },
                },
              },
              replies_count: { type: 'integer' },
            },
          },
        },
        display_name: 'Comments',
        short_desc: 'The list of comments on the post',
      },
      search_criteria: {
        type: {
          type: 'hash',
          fields: {
            limit: { type: 'integer' },
            order: { type: 'string' },
            filter: { type: 'string' },
            include_replies: { type: 'boolean' },
            fields_requested: {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
          },
        },
        display_name: 'Search Criteria',
        short_desc: 'The criteria used for retrieving comments',
      },
      cursors: {
        type: {
          type: 'hash',
          fields: {
            before: { type: 'string' },
            after: { type: 'string' },
          },
        },
        display_name: 'Cursors',
        short_desc: 'Cursors for pagination of results',
      },
      generated_at: {
        type: 'string',
        display_name: 'Generated At',
        short_desc: 'When this response was generated',
      },
    },
  },
});

export default getPostComments;
