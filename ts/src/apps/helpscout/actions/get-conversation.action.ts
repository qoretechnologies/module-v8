import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { HELPSCOUT_APP_NAME, HelpScoutError } from '../constants';
import { helpScoutApiClient } from '../helpers/constants';
import { formatHelpScoutResponse } from '../helpers/format-response';
import { getHelpScoutConversationAllowedValues } from '../helpers/get-conversation-allowed-values';
import { HelpScoutConversationResponseType } from '../response-types/conversation';

const action = 'get_conversation';

const options = {
  conversationId: {
    type: 'integer',
    required: true,
    get_allowed_values: getHelpScoutConversationAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = HelpScoutConversationResponseType;

const getHelpScoutConversation = QoreAppCreator.createLocalizedAction<typeof options>({
  app: HELPSCOUT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, conversationId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['conversationId'],
      connectionFields: ['token'],
      ErrorClass: HelpScoutError,
    });

    try {
      const conversation = await helpScoutApiClient<Record<string, any>>({
        token,
        path: `conversations/${conversationId}`,
        method: 'GET',
      });

      return formatHelpScoutResponse(conversation);
    } catch (error) {
      throw new HelpScoutError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default getHelpScoutConversation;
