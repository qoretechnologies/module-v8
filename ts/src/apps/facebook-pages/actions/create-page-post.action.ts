import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { FacebookAdsApi, Page, Post } from 'facebook-nodejs-business-sdk';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FACEBOOK_PAGES_APP_NAME, FacebookPagesError } from '../constants';
import { getFacebookPageIdAllowedValues } from '../helpers/get-page-id-allowed-values';

const options = {
  page_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getFacebookPageIdAllowedValues,
  },
  message: {
    required: false,
    type: 'string',
  },
  link: {
    required: false,
    type: 'string',
  },
  photo_urls: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
  },
  published: {
    required: false,
    type: 'boolean',
    default_value: true,
  },
  scheduled_publish_time: {
    required: false,
    type: 'string',
  },
  feed_story_visibility: {
    required: false,
    type: 'string',
    default_value: 'visible',
    allowed_values: [
      {
        value: 'visible',
        display_name: 'Visible',
        desc: 'Post will be visible in news feed',
      },
      {
        value: 'hidden',
        display_name: 'Hidden',
        desc: 'Post will be hidden from news feed',
      },
    ],
  },
  timeline_visibility: {
    required: false,
    type: 'string',
    default_value: 'normal',
    allowed_values: [
      {
        value: 'normal',
        display_name: 'Normal',
        desc: 'Post will appear normally on timeline',
      },
      {
        value: 'hidden',
        display_name: 'Hidden',
        desc: 'Post will be hidden from timeline',
      },
    ],
  },
} satisfies TQoreOptions;

const createPagePost = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FACEBOOK_PAGES_APP_NAME,
  action: 'create_page_post',
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

    const message = obj?.message?.trim();
    const link = obj?.link;
    const photos = obj?.photo_urls || [];
    const published = obj?.published === true;
    const scheduled_publish_time = obj?.scheduled_publish_time;
    const feed_story_visibility = obj?.feed_story_visibility || 'visible';
    const timeline_visibility = obj?.timeline_visibility || 'normal';

    if (!message && !link && !photos?.length) {
      throw new FacebookPagesError(
        'At least one of the following must be provided: message, link, or photos'
      );
    }

    if (scheduled_publish_time && published) {
      throw new FacebookPagesError(
        'Cannot set both published=true and scheduled_publish_time. Use published=false for scheduled posts.'
      );
    }

    try {
      let fb = FacebookAdsApi.init(token);
      const page = new Page(page_id);

      const pageInfo = await page.read(['id', 'name', 'access_token']);

      fb = FacebookAdsApi.init(pageInfo._data.access_token);
      const pageWithToken = new Page(page_id, undefined, undefined, fb);

      const postParams: Record<string, any> = {
        published,
        feed_story_visibility,
        timeline_visibility,
      };

      if (message) {
        postParams.message = message;
      }

      if (link) {
        postParams.link = link;
      }

      if (scheduled_publish_time) {
        postParams.scheduled_publish_time = Math.floor(
          new Date(scheduled_publish_time).getTime() / 1000
        );
      }

      let photoIds: string[] = [];
      if (photos?.length) {
        const photoData = photos.map((photo) => {
          return {
            url: photo,
            published: false,
          };
        });

        const imageUploads = await Promise.all(
          photoData.map((photo) => {
            return pageWithToken.createPhoto([], photo);
          })
        );

        photoIds = imageUploads.map((upload) => upload.id || upload._data?.id);
      }

      const attachedMedia = photoIds.map((id) => ({
        media_fbid: id,
      }));

      const response = await pageWithToken.createFeed([], {
        ...postParams,
        ...(attachedMedia.length > 0 && { attached_media: attachedMedia }),
      });

      const postId = response.id || response._data?.id;

      if (!postId) {
        throw new FacebookPagesError('Failed to create post - no post ID returned');
      }

      const post = new Post(postId, undefined, undefined, fb);

      const createdPost = await post.read([
        'id',
        'message',
        'story',
        'created_time',
        'permalink_url',
        'is_published',
        'scheduled_publish_time',
        'full_picture',
        'status_type',
      ]);

      return {
        success: true,
        post_id: postId,
        page_id,
        page_name: pageInfo._data.name,
        post_details: createdPost._data,
        post_url: createdPost._data.permalink_url,
        is_published: createdPost._data.is_published,
        created_at: createdPost._data.created_time,
        scheduled_publish_time: createdPost._data.scheduled_publish_time,
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof FacebookPagesError) {
        throw error;
      }
      throw new FacebookPagesError(`Failed to create page post: ${error.message || error}`);
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
      post_id: {
        type: 'string',
        display_name: 'Post ID',
        short_desc: 'The ID of the created post',
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
      post_details: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            message: { type: 'string' },
            story: { type: 'string' },
            created_time: { type: 'string' },
            permalink_url: { type: 'string' },
            is_published: { type: 'boolean' },
            scheduled_publish_time: { type: 'string' },
            full_picture: { type: 'string' },
            status_type: { type: 'string' },
          },
        },
        display_name: 'Post Details',
        short_desc: 'Detailed information about the created post',
      },
      post_url: {
        type: 'string',
        display_name: 'Post URL',
        short_desc: 'The permanent URL of the created post',
      },
      is_published: {
        type: 'boolean',
        display_name: 'Is Published',
        short_desc: 'Whether the post is currently published',
      },
      created_at: {
        type: 'string',
        display_name: 'Created At',
        short_desc: 'When the post was created',
      },
      scheduled_publish_time: {
        type: 'string',
        display_name: 'Scheduled Publish Time',
        short_desc: 'When the post is scheduled to be published (if applicable)',
      },
      generated_at: {
        type: 'string',
        display_name: 'Generated At',
        short_desc: 'When this response was generated',
      },
    },
  },
});

export default createPagePost;
