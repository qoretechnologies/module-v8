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
  spaceId: {
    required: true,
    type: 'string',
    get_allowed_values: getGoogleChatSpaceIdAllowedValues,
  },
  pageSize: {
    type: 'number',
    required: false,
    default_value: 20,
  },
  pageToken: {
    type: 'string',
    required: false,
  },
  filter: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'role', display_name: 'Role' },
            { value: 'member.type', display_name: 'Member Type' },
          ],
          on_change: ['refetch'],
        },
        value: {
          type: 'string',
          required: true,
          allowed_values_creatable: true,
          get_allowed_values: (context) => {
            const filter = context?.opts;

            if (filter?.field === 'role') {
              return [
                { value: 'ROLE_MEMBER', display_name: 'Member' },
                { value: 'ROLE_MANAGER', display_name: 'Manager' },
              ];
            }

            if (filter?.field === 'member.type') {
              return [
                { value: 'HUMAN', display_name: 'Human' },
                { value: 'BOT', display_name: 'Bot' },
              ];
            }

            return [];
          },
        },
      },
    },
  },
  showGroups: {
    type: 'boolean',
    required: false,
  },
  showInvited: {
    type: 'boolean',
    required: false,
  },
  useAdminAccess: {
    type: 'boolean',
    required: false,
  },
} satisfies TQoreOptions;

const listMembers = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_CHAT_APP_NAME,
  action: 'list_members',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, spaceId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['spaceId'],
      ErrorClass: GoogleChatError,
    });

    const pageSize = obj?.pageSize?.toString() || '20';
    const pageToken = obj?.pageToken;
    const filter = obj?.filter;
    const showGroups = String(obj?.showGroups || false);
    const showInvited = String(obj?.showInvited || false);
    const useAdminAccess = String(obj?.useAdminAccess || false);

    try {
      const params = {
        pageSize,
        ...(pageToken && { pageToken }),
        ...(filter && { [filter.field]: filter.value }),
        ...(showGroups && { showGroups }),
        ...(showInvited && { showInvited }),
        ...(useAdminAccess && { useAdminAccess }),
      };

      const response = await QorusRequest.get<{ data: chat_v1.Schema$ListMembershipsResponse }>(
        {
          path: `/v1/${spaceId}/members`,
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        { endpointId: GOOGLE_CHAT_APP_NAME, url: 'https://chat.googleapis.com' }
      );

      return response?.data;
    } catch (error) {
      throw new GoogleChatError(`Failed to list members: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      memberships: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              state: { type: 'string' },
              createTime: { type: 'string' },
              role: { type: 'string' },
              member: {
                type: {
                  type: 'hash',
                  fields: {
                    name: { type: 'string' },
                    type: { type: 'string' },
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

export default listMembers;
