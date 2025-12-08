import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { FacebookAdsApi, Page, Post } from 'facebook-nodejs-business-sdk';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FACEBOOK_PAGES_APP_NAME, FacebookPagesError } from '../constants';
import { getFacebookPageIdAllowedValues } from '../helpers/get-page-id-allowed-values';
import { getFacebookPostIdAllowedValues } from '../helpers/get-post-id-allowed-values';
import { FacebookPostFieldsAllowedValues } from '../helpers/get-post-fields-allowed-values';

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
    default_value: ['id', 'message', 'created_time', 'permalink_url', 'is_published'],
    element_allowed_values: FacebookPostFieldsAllowedValues,
  },
} satisfies TQoreOptions;

const getPagePost = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FACEBOOK_PAGES_APP_NAME,
  action: 'get_page_post',
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
      'permalink_url',
      'is_published',
    ];

    try {
      let fb = FacebookAdsApi.init(token);
      const page = new Page(page_id);

      const pageInfo = await page.read(['id', 'name', 'access_token']);

      fb = FacebookAdsApi.init(pageInfo._data.access_token);
      const post = new Post(post_id, undefined, undefined, fb);

      const postData = await post.read(fields);

      if (!postData || !postData._data) {
        throw new FacebookPagesError(`Post with ID ${post_id} not found`);
      }

      const formattedPost: Record<string, any> = { ...postData._data };

      if (postData._data.likes?.summary) {
        formattedPost.likes_count = postData._data.likes.summary.total_count;
        delete formattedPost.likes;
      }
      if (postData._data.comments?.summary) {
        formattedPost.comments_count = postData._data.comments.summary.total_count;
        delete formattedPost.comments;
      }
      if (postData._data.shares) {
        formattedPost.shares_count = postData._data.shares.count || 0;
      }
      if (postData._data.reactions?.summary) {
        formattedPost.reactions_count = postData._data.reactions.summary.total_count;
        delete formattedPost.reactions;
      }

      return {
        page_id,
        page_name: pageInfo._data.name,
        post_id,
        post_data: formattedPost,
        fields_requested: fields,
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof FacebookPagesError) {
        throw error;
      }
      throw new FacebookPagesError(`Failed to get page post: ${error.message || error}`);
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
      post_data: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            message: { type: 'string' },
            story: { type: 'string' },
            created_time: { type: 'string' },
            updated_time: { type: 'string' },
            permalink_url: { type: 'string' },
            full_picture: { type: 'string' },
            is_published: { type: 'bool' },
            is_hidden: { type: 'bool' },
            is_popular: { type: 'bool' },
            status_type: { type: 'string' },
            type: { type: 'string' },
            likes_count: { type: 'integer' },
            comments_count: { type: 'integer' },
            shares_count: { type: 'integer' },
            reactions_count: { type: 'integer' },
            privacy: {
              type: {
                type: 'hash',
                fields: {
                  value: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
            scheduled_publish_time: { type: 'string' },
            admin_creator: {
              type: {
                type: 'hash',
                fields: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
        display_name: 'Post Data',
        short_desc: 'The complete post data with requested fields',
      },
      fields_requested: {
        type: {
          type: 'list',
          element_type: 'string',
        },
        display_name: 'Fields Requested',
        short_desc: 'The fields that were requested for the post',
      },
      generated_at: {
        type: 'string',
        display_name: 'Generated At',
        short_desc: 'When this response was generated',
      },
    },
  },
});

export default getPagePost;
