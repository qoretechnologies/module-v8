import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { LINKED_IN_APP_NAME, LinkedInError } from '../constants';
import { linkedInApiClient } from '../helpers/constants';

const action = 'create_user_text_post';

const options = {
  content: {
    required: true,
    type: 'string',
  },
  mentions: {
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          entity: {
            type: 'string',
            allowed_values: [{ value: 'company', display_name: 'Company' }],
            required: true,
          },
          urn: {
            type: 'string',
            required: true,
          },
          start: {
            type: 'integer',
            required: true,
          },
        },
      },
    },
  },
  visibility: {
    required: true,
    type: 'string',
    allowed_values: [
      { value: 'PUBLIC', display_name: 'Public' },
      { value: 'CONNECTIONS', display_name: 'Connections Only' },
    ],
  },
  link: {
    required: false,
    type: {
      type: 'hash',
      fields: {
        description: {
          type: 'string',
          required: false,
        },
        url: {
          type: 'string',
          required: true,
        },
        title: {
          type: 'string',
          required: true,
        },
      },
    },
  },
} satisfies TQoreOptions;

const createUserTextPost = QoreAppCreator.createLocalizedAction<typeof options>({
  app: LINKED_IN_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, content, visibility } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['content', 'visibility'],
      connectionFields: ['token'],
      ErrorClass: LinkedInError,
    });

    const mentions = obj?.mentions || [];
    const mediaType = obj?.link ? 'ARTICLE' : 'NONE';
    const link = obj?.link;

    try {
      const currentUser = await linkedInApiClient<{ sub: string }>({
        token,
        path: `userinfo`,
        method: 'GET',
      });

      const userUrn = `urn:li:person:${currentUser.sub}`;

      const requestBody = {
        author: userUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content,
              ...(mentions.length > 0 && {
                attributes: mentions.map((mention) => ({
                  start: mention.start,
                  value: {
                    'com.linkedin.common.CompanyAttributedEntity': {
                      [mention.entity]: mention.urn,
                      start: mention.start || 0,
                    },
                  },
                })),
              }),
            },
            shareMediaCategory: mediaType,
            ...(link && {
              media: [
                {
                  status: 'READY',
                  description: {
                    text: link.description,
                  },
                  originalUrl: link.url,
                  title: {
                    text: link.title,
                  },
                },
              ],
            }),
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': visibility,
        },
      };

      const response = await linkedInApiClient({
        token,
        path: 'ugcPosts',
        method: 'POST',
        body: requestBody,
      });

      return response;
    } catch (error) {
      throw new LinkedInError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },

  response_type: {
    type: 'hash',
    fields: {
      id: {
        type: 'string',
      },
    },
  },
});

export default createUserTextPost;
