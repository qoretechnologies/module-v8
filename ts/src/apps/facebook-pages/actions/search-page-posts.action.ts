import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { FacebookAdsApi, Page } from 'facebook-nodejs-business-sdk';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FACEBOOK_PAGES_APP_NAME, FacebookPagesError } from '../constants';
import { getFacebookPageIdAllowedValues } from '../helpers/get-page-id-allowed-values';
import { FacebookPostFieldsAllowedValues } from '../helpers/get-post-fields-allowed-values';

const options = {
  page_id: {
    required: true,
    type: 'string',
    get_allowed_values: getFacebookPageIdAllowedValues,
  },
  limit: {
    required: false,
    type: 'integer',
    default_value: 25,
  },
  since: {
    required: false,
    type: 'string',
  },
  until: {
    required: false,
    type: 'string',
  },
  search_text: {
    required: false,
    type: 'string',
  },

  include_hidden: {
    required: false,
    type: 'boolean',
    default_value: false,
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

const searchPagePosts = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FACEBOOK_PAGES_APP_NAME,
  action: 'search_page_posts',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, page_id } = getQoreContextRequiredValues<{
      token: string;
      page_id: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['page_id'],
      connectionFields: ['token'],
      ErrorClass: FacebookPagesError,
    });

    const limit = obj?.limit || 25;
    const since = obj?.since;
    const until = obj?.until;
    const searchText = obj?.search_text;
    const includeHidden = obj?.include_hidden || false;
    const fields = obj?.fields || [
      'id',
      'message',
      'created_time',
      'permalink_url',
      'is_published',
    ];

    if (limit > 100) {
      throw new FacebookPagesError('Limit cannot exceed 100 posts');
    }

    try {
      let fb = FacebookAdsApi.init(token);
      const page = new Page(page_id);

      const pageInfo = await page.read(['id', 'name', 'access_token']);
      fb = FacebookAdsApi.init(pageInfo._data.access_token);

      const pageWithToken = new Page(page_id, undefined, undefined, fb);

      const params: Record<string, any> = {
        limit,
        fields: fields.join(','),
      };

      if (since) {
        params.since = since;
      }
      if (until) {
        params.until = until;
      }

      if (includeHidden) {
        params.include_hidden = true;
      }

      const postsResponse = await pageWithToken.getPosts(fields, params);
      let posts: Record<string, any>[] = postsResponse || [];
      const cursors = postsResponse?.paging?.cursors;

      if (searchText) {
        const searchLower = searchText.toLowerCase();
        posts = posts.filter((post: any) => {
          const message = (post._data.message || '').toLowerCase();
          const story = (post._data.story || '').toLowerCase();

          return message.includes(searchLower) || story.includes(searchLower);
        });
      }

      const formattedPosts = posts.map((post: any) => {
        const formattedPost: Record<string, any> = { ...post._data };

        if (post._data.likes?.summary) {
          formattedPost.likes_count = post._data.likes.summary.total_count;
          delete formattedPost.likes;
        }
        if (post._data.comments?.summary) {
          formattedPost.comments_count = post._data.comments.summary.total_count;
          delete formattedPost.comments;
        }
        if (post._data.shares) {
          formattedPost.shares_count = post._data.shares.count || 0;
        }

        return formattedPost;
      });

      return {
        success: true,
        page_id,
        page_name: pageInfo._data.name,
        total_posts: formattedPosts.length,
        posts: formattedPosts,
        search_criteria: {
          limit,
          since,
          until,
          search_text: searchText,
          include_hidden: includeHidden,
          fields_requested: fields,
        },
        generated_at: new Date().toISOString(),
        cursors,
      };
    } catch (error) {
      if (error instanceof FacebookPagesError) {
        throw error;
      }
      throw new FacebookPagesError(`Failed to search page posts: ${error.message || error}`);
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
      total_posts: {
        type: 'integer',
        display_name: 'Total Posts',
        short_desc: 'The total number of posts found',
      },
      posts: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              message: { type: 'string' },
              story: { type: 'string' },
              created_time: { type: 'string' },
              updated_time: { type: 'string' },
              permalink_url: { type: 'string' },
              full_picture: { type: 'string' },
              is_published: { type: 'boolean' },
              is_hidden: { type: 'boolean' },
              is_popular: { type: 'boolean' },
              status_type: { type: 'string' },
              type: { type: 'string' },
              likes_count: { type: 'integer' },
              comments_count: { type: 'integer' },
              shares_count: { type: 'integer' },
            },
          },
        },
        display_name: 'Posts',
        short_desc: 'The list of posts found',
      },
      search_criteria: {
        type: {
          type: 'hash',
          fields: {
            limit: { type: 'integer' },
            since: { type: 'string' },
            until: { type: 'string' },
            search_text: { type: 'string' },
            include_hidden: { type: 'boolean' },
            fields_requested: {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
          },
        },
        display_name: 'Search Criteria',
        short_desc: 'The criteria used for searching posts',
      },
      generated_at: {
        type: 'string',
        display_name: 'Generated At',
        short_desc: 'When the search was performed',
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
    },
  },
});

export default searchPagePosts;
