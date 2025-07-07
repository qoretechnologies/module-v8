import { chat_v1 } from '@googleapis/chat';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_CHAT_APP_NAME, GoogleChatError } from '../constants';

const options = {
  pageSize: {
    type: 'number',
    required: false,
    default_value: 20,
  },
  pageToken: {
    type: 'string',
    required: false,
  },
  spaceType: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'SPACE', display_name: 'Space' },
      { value: 'GROUP_CHAT', display_name: 'Group Chat' },
      { value: 'DIRECT_MESSAGE', display_name: 'Direct Message' },
    ],
  },
} satisfies TQoreOptions;

const listSpaces = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_CHAT_APP_NAME,
  action: 'list_spaces',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: GoogleChatError,
    });

    const pageSize = obj?.pageSize?.toString() || '20';
    const spaceType = obj?.spaceType;
    const pageToken = obj?.pageToken;

    try {
      const params = {
        pageSize,
        fields: '*',
        ...(pageToken && { pageToken }),
        ...((spaceType && { filter: `spaceType="${spaceType}"` }) || {}),
      };

      const response = await QorusRequest.get<{ data: chat_v1.Schema$ListSpacesResponse }>(
        {
          path: '/v1/spaces',
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        { endpointId: GOOGLE_CHAT_APP_NAME, url: 'https://chat.googleapis.com' }
      );

      return response?.data;
    } catch (error) {
      throw new GoogleChatError(`Failed to list spaces: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      spaces: {
        type: {
          type: 'list',
          element_type: {
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
              spaceUri: { type: 'string' },
              membershipCount: {
                type: {
                  type: 'hash',
                  fields: {
                    joinedDirectHumanCount: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
      nextPageToken: { type: 'string', required: false },
    },
  },
});

export default listSpaces;
