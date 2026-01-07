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

const action = 'add_conversation_followers';

const options = {
  conversationId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontConversationAllowedValues,
  },
  teammateIds: {
    type: { type: 'list', element_type: 'string' },
    required: true,
    get_allowed_values: getFrontTeammateAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    conversationId: { type: 'string' },
    teammateIds: { type: { type: 'list', element_type: 'string' } },
  },
} satisfies TQoreResponseType;

const addFrontConversationFollowers = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, conversationId, teammateIds } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['conversationId', 'teammateIds'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    try {
      await frontClient.post(
        `conversations/${conversationId}/followers`,
        { teammate_ids: teammateIds },
        { token }
      );

      return {
        success: true,
        conversationId,
        teammateIds,
      };
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default addFrontConversationFollowers;
