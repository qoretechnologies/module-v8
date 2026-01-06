import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { frontClient } from '../client';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { formatFrontResponse } from '../helpers/format-response';
import { getFrontConversationAllowedValues } from '../helpers/get-conversation-allowed-values';
import { FrontMessageResponseType } from '../response-types/message';

const action = 'list_conversation_messages';

const options = {
  conversationId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontConversationAllowedValues,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 50,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'list',
  element_type: FrontMessageResponseType,
} satisfies TQoreResponseType;

const listFrontConversationMessages = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { limit } = obj || {};

    try {
      const messages = await frontClient.fetchPaginated<Record<string, any>>({
        path: `conversations/${conversationId}/messages`,
        token,
        maxResults: limit || 50,
      });

      return formatFrontResponse(messages);
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listFrontConversationMessages;
