import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { HELPSCOUT_APP_NAME, HelpScoutError } from '../constants';
import { helpScoutApiClient } from '../helpers/constants';
import { formatHelpScoutResponse } from '../helpers/format-response';
import { getHelpScoutConversationAllowedValues } from '../helpers/get-conversation-allowed-values';
import { getHelpScoutThreadAllowedValues } from '../helpers/get-thread-allowed-values';
import { HelpScoutThreadResponseType } from '../response-types/conversation';

const action = 'get_thread';

const options = {
  conversationId: {
    type: 'integer',
    required: true,
    get_allowed_values: getHelpScoutConversationAllowedValues,
  },
  threadId: {
    type: 'integer',
    required: true,
    get_allowed_values: getHelpScoutThreadAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = HelpScoutThreadResponseType;

const getHelpScoutThread = QoreAppCreator.createLocalizedAction<typeof options>({
  app: HELPSCOUT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, conversationId, threadId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['conversationId', 'threadId'],
      connectionFields: ['token'],
      ErrorClass: HelpScoutError,
    });

    try {
      const thread = await helpScoutApiClient<Record<string, any>>({
        token,
        path: `conversations/${conversationId}/threads/${threadId}`,
        method: 'GET',
      });

      return formatHelpScoutResponse(thread);
    } catch (error) {
      throw new HelpScoutError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default getHelpScoutThread;
