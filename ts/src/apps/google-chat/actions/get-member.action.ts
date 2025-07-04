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
import { getGoogleChatMemberIdAllowedValues } from '../helpers/get-member-id-allowed-values';

const options = {
  spaceId: {
    required: false,
    preselected: true,
    type: 'string',
    get_allowed_values: getGoogleChatSpaceIdAllowedValues,
    on_change: ['refetch'],
  },
  memberId: {
    required: true,
    type: 'string',
    get_allowed_values: getGoogleChatMemberIdAllowedValues,
  },
} satisfies TQoreOptions;

const listMembers = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_CHAT_APP_NAME,
  action: 'get_member',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, memberId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['memberId'],
      ErrorClass: GoogleChatError,
    });

    try {
      const response = await QorusRequest.get<{ data: chat_v1.Schema$Membership }>(
        {
          path: `/v1/${memberId}`,
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
});

export default listMembers;
