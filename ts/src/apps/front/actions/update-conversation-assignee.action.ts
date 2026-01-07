import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { frontClient } from '../client';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { getFrontConversationAllowedValues } from '../helpers/get-conversation-allowed-values';
import { getFrontTeammateAllowedValues } from '../helpers/get-teammate-allowed-values';

const action = 'update_conversation_assignee';

const options = {
  conversationId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontConversationAllowedValues,
  },
  assigneeId: {
    type: 'string',
    required: false,
    get_allowed_values: getFrontTeammateAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    conversationId: { type: 'string' },
    assigneeId: { type: 'string' },
  },
} satisfies TQoreResponseType;

const updateFrontConversationAssignee = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { assigneeId } = obj || {};

    try {
      const body: Record<string, any> = {
        assignee_id: assigneeId || null,
      };

      await frontClient.put(`conversations/${conversationId}/assignee`, body, { token });

      return {
        success: true,
        conversationId,
        assigneeId: assigneeId || null,
      };
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default updateFrontConversationAssignee;
