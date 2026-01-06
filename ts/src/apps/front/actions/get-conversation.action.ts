import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { frontClient } from '../client';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { formatFrontResponse } from '../helpers/format-response';
import { getFrontConversationAllowedValues } from '../helpers/get-conversation-allowed-values';
import { FrontConversationResponseType } from '../response-types/conversation';

const action = 'get_conversation';

const options = {
  conversationId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontConversationAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = FrontConversationResponseType;

const getFrontConversation = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, conversationId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['conversationId'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    try {
      const conversation = await frontClient.get<Record<string, any>>(
        `conversations/${conversationId}`,
        { token }
      );

      return formatFrontResponse(conversation);
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default getFrontConversation;
