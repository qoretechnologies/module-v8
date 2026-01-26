import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { frontClient } from '../client';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { formatFrontResponse } from '../helpers/format-response';
import { getFrontConversationAllowedValues } from '../helpers/get-conversation-allowed-values';
import { FrontCommentResponseType } from '../response-types/comment';

const action = 'add_conversation_comment';

const options = {
  conversationId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontConversationAllowedValues,
  },
  body: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const responseType = FrontCommentResponseType;

const addFrontConversationComment = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, conversationId, body } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['conversationId', 'body'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    try {
      const comment = await frontClient.post<Record<string, any>>(
        `conversations/${conversationId}/comments`,
        { body },
        { token }
      );

      return formatFrontResponse(comment);
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default addFrontConversationComment;
