import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { FacebookAdsApi, Page, Post } from 'facebook-nodejs-business-sdk';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { FACEBOOK_PAGES_APP_NAME, FacebookPagesError } from '../constants';
import { createFacebookClient } from '../helpers/constants';
import { FacebookCommentFieldsAllowedValues } from '../helpers/get-comment-fields-allowed-values';
import { getFacebookPageIdAllowedValues } from '../helpers/get-page-id-allowed-values';
import { getFacebookPostIdAllowedValues } from '../helpers/get-post-id-allowed-values';

type FacebookComment = {
  id: string;
  message: string;
  created_time: string;
  updated_time?: string;
  like_count?: number;
  comment_count?: number;
  parent?: {
    id: string;
    created_time: string;
  };
  from: {
    id: string;
    name: string;
    picture?: {
      data: {
        url: string;
      };
    };
  };
  object?: {
    id: string;
    created_time: string;
  };
  permalink_url?: string;
  can_hide?: boolean;
  can_like?: boolean;
  can_reply?: boolean;
  can_remove?: boolean;
  is_hidden?: boolean;
  is_private?: boolean;
  user_likes?: boolean;
  attachment?: {
    media?: {
      image?: {
        src: string;
        height: number;
        width: number;
      };
    };
    target?: {
      id: string;
      url: string;
    };
    type: string;
    url?: string;
  };
};

const defaultFields = [
  'id',
  'message',
  'created_time',
  'from',
  'like_count',
  'comment_count',
  'permalink_url',
];

const commentFields = {
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
  like_count: { type: 'number' },
  comment_count: { type: 'number' },
  permalink_url: { type: 'string' },
  updated_time: { type: 'string' },
  parent: {
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        created_time: { type: 'string' },
      },
    },
  },
  object: {
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        created_time: { type: 'string' },
      },
    },
  },
  can_hide: { type: 'bool' },
  can_like: { type: 'bool' },
  can_reply: { type: 'bool' },
  can_remove: { type: 'bool' },
  is_hidden: { type: 'bool' },
  is_private: { type: 'bool' },
  user_likes: { type: 'bool' },
  attachment: {
    type: {
      type: 'hash',
      fields: {
        media: {
          type: {
            type: 'hash',
            fields: {
              image: {
                type: {
                  type: 'hash',
                  fields: {
                    src: { type: 'string' },
                    height: { type: 'number' },
                    width: { type: 'number' },
                  },
                },
              },
            },
          },
        },
        target: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              url: { type: 'string' },
            },
          },
        },
        type: { type: 'string' },
        url: { type: 'string' },
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
    from: {
      type: {
        type: 'hash',
        fields: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
      },
    },
    like_count: { type: 'number' },
    comment_count: { type: 'number' },
    permalink_url: { type: 'string' },
  },
} satisfies TQoreTypeObject;

const FacebookPagesNewPostCommentTrigger = QoreAppCreator.createLocalizedTrigger({
  app: FACEBOOK_PAGES_APP_NAME,
  action: 'new_post_comment',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    page_id: {
      type: 'string',
      required: true,
      get_allowed_values: getFacebookPageIdAllowedValues,
      on_change: ['refetch'],
    },
    post_id: {
      type: 'string',
      required: true,
      get_allowed_values: getFacebookPostIdAllowedValues,
      depends_on: ['page_id'],
    },
    fields: {
      type: {
        type: 'list',
        element_type: 'string',
      },
      required: false,
      default_value: defaultFields,
      element_allowed_values: FacebookCommentFieldsAllowedValues,
    },
    include_hidden: {
      type: 'bool',
      required: false,
      default_value: false,
    },
    include_replies: {
      type: 'bool',
      required: false,
      default_value: true,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token, page_id, post_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['page_id', 'post_id'],
      ErrorClass: FacebookPagesError,
    });

    const { fields, include_hidden, include_replies } = context.opts || {};
    const fb = createFacebookClient(token);
    const page = new Page(page_id, undefined, undefined, fb);
    const pageInfo = await page.read(['id', 'name', 'access_token']);

    const getItems = () => {
      return fetchLatestComments({
        token: pageInfo._data.access_token,
        post_id,
        fields: fields || defaultFields,
        include_hidden: include_hidden === true,
        include_replies: include_replies !== false,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'facebook_pages_new_post_comment',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, page_id, post_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['page_id', 'post_id'],
      ErrorClass: FacebookPagesError,
    });

    const fb = createFacebookClient(token);
    const page = new Page(page_id, undefined, undefined, fb);
    const pageInfo = await page.read(['id', 'name', 'access_token']);
    const { fields, include_hidden, include_replies } = context.opts || {};

    const comments = await fetchLatestComments({
      token: pageInfo._data.access_token,
      post_id,
      fields: fields || defaultFields,
      include_hidden: include_hidden === true,
      include_replies: include_replies === true,
    });

    return comments?.length > 0 ? comments[0] : null;
  },
  event_info: {
    desc: 'Facebook Pages New Post Comment Trigger Event Info',
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
              commentFields[key as keyof typeof commentFields] ?? { type: 'any' },
            ])
          ),
        }
      : defaultEventInfoType;
  },
});

export default FacebookPagesNewPostCommentTrigger;

const fetchLatestComments = async (options: {
  token: string;
  post_id: string;
  fields: string[];
  include_hidden: boolean;
  include_replies: boolean;
}) => {
  const { token, post_id, fields, include_hidden, include_replies } = options;
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const fb = FacebookAdsApi.init(token);

    const fieldsToRetrieve =
      fields.length > 0
        ? fields
        : ['id', 'message', 'created_time', 'from', 'like_count', 'comment_count'];

    const comments: FacebookComment[] = [];

    const post = new Post(post_id, undefined, undefined, fb);

    const params: Record<string, any> = {
      limit,
      order: 'reverse_chronological',
      filter: include_replies ? 'stream' : 'toplevel',
    };

    const commentsResponse = await post.getComments(fieldsToRetrieve, params);

    const fetchedComments = commentsResponse.map((comment: any) => comment._data);
    comments.push(...fetchedComments);

    const filteredComments = comments.filter((comment: FacebookComment) => {
      if (!include_hidden && comment.is_hidden) {
        return false;
      }

      return true;
    });

    return filteredComments;
  } catch (error) {
    throw new FacebookPagesError(`Failed to fetch latest comments: ${error.message || error}`);
  }
};
