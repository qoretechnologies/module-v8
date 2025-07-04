import { chat_v1 } from '@googleapis/chat';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_CHAT_APP_NAME, GoogleChatError } from '../constants';
import { getGoogleChatSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleChatSpaceIdAllowedValues,
  },
} satisfies TQoreOptions;

const getSpace = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_CHAT_APP_NAME,
  action: 'get_space',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['id'],
      ErrorClass: GoogleChatError,
    });

    try {
      const response = await QorusRequest.get<{ data: chat_v1.Schema$ListSpacesResponse }>(
        {
          path: `/v1/${id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        { endpointId: GOOGLE_CHAT_APP_NAME, url: 'https://chat.googleapis.com' }
      );

      return response?.data;
    } catch (error) {
      throw new GoogleChatError(`Failed to get the space: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      name: { type: 'string' },
      type: { type: 'string' },
      displayName: { type: 'string' },
      externalUserAllowed: { type: 'boolean' },
      spaceThreadingState: { type: 'string' },
      spaceType: { type: 'string' },
      spaceHistoryState: { type: 'string' },
      createTime: { type: 'string' },
      lastActiveTime: { type: 'string' },
      membershipCount: {
        type: {
          type: 'hash',
          fields: {
            joinedDirectHumanUserCount: { type: 'integer' },
          },
        },
      },
      accessSettings: {
        type: {
          type: 'hash',
          fields: {
            accessState: { type: 'string' },
          },
        },
      },
      spaceUri: { type: 'string' },
      permissionSettings: {
        type: {
          type: 'hash',
          fields: {
            manageMembersAndGroups: {
              type: {
                type: 'hash',
                fields: {
                  managersAllowed: { type: 'boolean' },
                  membersAllowed: { type: 'boolean' },
                },
              },
            },
            modifySpaceDetails: {
              type: {
                type: 'hash',
                fields: {
                  managersAllowed: { type: 'boolean' },
                  membersAllowed: { type: 'boolean' },
                },
              },
            },
            toggleHistory: {
              type: {
                type: 'hash',
                fields: {
                  managersAllowed: { type: 'boolean' },
                  membersAllowed: { type: 'boolean' },
                },
              },
            },
            useAtMentionAll: {
              type: {
                type: 'hash',
                fields: {
                  managersAllowed: { type: 'boolean' },
                  membersAllowed: { type: 'boolean' },
                },
              },
            },
            manageApps: {
              type: {
                type: 'hash',
                fields: {
                  managersAllowed: { type: 'boolean' },
                  membersAllowed: { type: 'boolean' },
                },
              },
            },
            manageWebhooks: {
              type: {
                type: 'hash',
                fields: {
                  managersAllowed: { type: 'boolean' },
                  membersAllowed: { type: 'boolean' },
                },
              },
            },
            postMessages: {
              type: {
                type: 'hash',
                fields: {
                  managersAllowed: { type: 'boolean' },
                  membersAllowed: { type: 'boolean' },
                },
              },
            },
            replyMessages: {
              type: {
                type: 'hash',
                fields: {
                  managersAllowed: { type: 'boolean' },
                  membersAllowed: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
  },
});

export default getSpace;
