import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_CHAT_APP_NAME, GoogleChatError } from '../constants';
import { getGoogleChatMessageIdAllowedValues } from '../helpers/get-message-id-allowed-values';
import { getGoogleChatSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';

const options = {
  spaceId: {
    required: false,
    preselected: true,
    type: 'string',
    get_allowed_values: getGoogleChatSpaceIdAllowedValues,
    on_change: ['refetch'],
  },
  messageId: {
    required: true,
    type: 'string',
    get_allowed_values: getGoogleChatMessageIdAllowedValues,
    allowed_values_creatable: true,
  },
  force: {
    type: 'bool',
    required: false,
  },
} satisfies TQoreOptions;

const deleteMessage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_CHAT_APP_NAME,
  action: 'delete_message',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, messageId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['messageId'],
      ErrorClass: GoogleChatError,
    });

    try {
      await QorusRequest.deleteReq(
        {
          path: `/v1/${messageId}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        { endpointId: GOOGLE_CHAT_APP_NAME, url: 'https://chat.googleapis.com' }
      );

      return;
    } catch (error) {
      throw new GoogleChatError(`Failed to delete message: ${error}`);
    }
  },
});

export default deleteMessage;
