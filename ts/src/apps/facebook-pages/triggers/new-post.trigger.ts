import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { FacebookAdsApi, Page } from 'facebook-nodejs-business-sdk';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { FACEBOOK_PAGES_APP_NAME, FacebookPagesError } from '../constants';
import { getFacebookPageIdAllowedValues } from '../helpers/get-page-id-allowed-values';
import { FacebookPostFieldsAllowedValues } from '../helpers/get-post-fields-allowed-values';
import { createFacebookClient } from '../helpers/constants';

type FacebookPost = {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  updated_time?: string;
  type: string;
  status_type?: string;
  permalink_url?: string;
  full_picture?: string;
  link?: string;
  name?: string;
  description?: string;
  caption?: string;
  source?: string;
  picture?: string;
  icon?: string;
  application?: {
    name: string;
    id: string;
  };
  is_published?: boolean;
  is_hidden?: boolean;
  privacy?: {
    value: string;
    description?: string;
  };
  place?: {
    id: string;
    name: string;
    location?: {
      city?: string;
      country?: string;
      latitude?: number;
      longitude?: number;
      state?: string;
      street?: string;
      zip?: string;
    };
  };
};

const defaultFields = [
  'id',
  'message',
  'created_time',
  'permalink_url',
  'full_picture',
  'is_published',
  'is_hidden',
];

const postFields = {
  id: { type: 'string' },
  message: { type: 'string' },
  created_time: { type: 'string' },
  permalink_url: { type: 'string' },
  full_picture: { type: 'string' },
  is_published: { type: 'bool' },
  is_hidden: { type: 'bool' },
  story: { type: 'string' },
  updated_time: { type: 'string' },
  type: { type: 'string' },
  status_type: { type: 'string' },
  link: { type: 'string' },
  name: { type: 'string' },
  description: { type: 'string' },
  caption: { type: 'string' },
  source: { type: 'string' },
  picture: { type: 'string' },
  icon: { type: 'string' },
  application: {
    type: {
      type: 'hash',
      fields: {
        name: { type: 'string' },
        id: { type: 'string' },
      },
    },
  },
  privacy: {
    type: {
      type: 'hash',
      fields: {
        value: { type: 'string' },
        description: { type: 'string' },
      },
    },
  },
  place: {
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        name: { type: 'string' },
        location: {
          type: {
            type: 'hash',
            fields: {
              city: { type: 'string' },
              country: { type: 'string' },
              latitude: { type: 'number' },
              longitude: { type: 'number' },
              state: { type: 'string' },
              street: { type: 'string' },
              zip: { type: 'string' },
            },
          },
        },
      },
    },
  },
} satisfies Record<string, TQoreAppActionOption>;

const defaultEventInfoType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    message: { type: 'string' },
    created_time: { type: 'string' },
    permalink_url: { type: 'string' },
    full_picture: { type: 'string' },
    is_published: { type: 'bool' },
    is_hidden: { type: 'bool' },
  },
} satisfies TQoreTypeObject;

const FacebookPagesNewPostTrigger = QoreAppCreator.createLocalizedTrigger({
  app: FACEBOOK_PAGES_APP_NAME,
  action: 'new_post',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    page_id: {
      type: 'string',
      required: true,
      get_allowed_values: getFacebookPageIdAllowedValues,
    },
    fields: {
      type: {
        type: 'list',
        element_type: 'string',
      },
      required: false,
      default_value: defaultFields,
      element_allowed_values: FacebookPostFieldsAllowedValues,
    },
    include_hidden: {
      type: 'bool',
      required: false,
      default_value: false,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token, page_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['page_id'],
      ErrorClass: FacebookPagesError,
    });

    const { fields, include_hidden } = context.opts || {};
    const fb = createFacebookClient(token);
    const page = new Page(page_id, undefined, undefined, fb);
    const pageInfo = await page.read(['id', 'name', 'access_token']);

    const getItems = () => {
      return fetchLatestPosts({
        token: pageInfo._data.access_token,
        page_id,
        fields: fields || defaultFields,
        include_hidden: include_hidden === true,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'facebook_pages_new_post',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, page_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['page_id'],
      ErrorClass: FacebookPagesError,
    });

    const fb = createFacebookClient(token);
    const page = new Page(page_id, undefined, undefined, fb);
    const pageInfo = await page.read(['id', 'name', 'access_token']);
    const fields = context.opts?.fields || defaultFields;
    const include_hidden = context.opts?.include_hidden === true;

    const posts = await fetchLatestPosts({
      token: pageInfo._data.access_token,
      page_id,
      fields,
      include_hidden,
    });

    return posts?.length > 0 ? posts[0] : null;
  },
  event_info: {
    desc: 'Facebook Pages New Post Trigger Event Info',
    type: defaultEventInfoType,
  },
  get_dynamic_type: (context) => {
    const fields: string[] = context?.opts?.fields || [];

    return fields?.length
      ? {
          type: 'hash',
          fields: Object.fromEntries(
            fields.map((key) => [
              key,
              postFields[key as keyof typeof postFields] ?? { type: 'any' },
            ])
          ),
        }
      : defaultEventInfoType;
  },
});

export default FacebookPagesNewPostTrigger;

const fetchLatestPosts = async (options: {
  token: string;
  page_id: string;
  fields: string[];
  include_hidden: boolean;
}) => {
  const { token, page_id, fields, include_hidden } = options;
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const fb = FacebookAdsApi.init(token);
    const page = new Page(page_id, undefined, undefined, fb);

    const fieldsToRetrieve =
      fields.length > 0
        ? fields
        : ['id', 'message', 'created_time', 'permalink_url', 'full_picture'];

    const posts: FacebookPost[] = [];

    const params: any = {
      limit,
    };

    const postsPage = await page.getPosts(fieldsToRetrieve, params);

    const fetchedPosts = postsPage.map((post) => post._data);

    const visibilityFilteredPosts = fetchedPosts.filter((post: FacebookPost) => {
      if (include_hidden) return true;

      return !post.is_hidden;
    });

    posts.push(...visibilityFilteredPosts);

    return posts.slice(0, limit);
  } catch (error) {
    throw new FacebookPagesError(`Failed to fetch latest posts: ${error.message || error}`);
  }
};
