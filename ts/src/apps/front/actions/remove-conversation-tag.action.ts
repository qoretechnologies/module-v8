import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { frontApiClient } from '../helpers/constants';
import { getFrontConversationAllowedValues } from '../helpers/get-conversation-allowed-values';
import { getFrontTagAllowedValues } from '../helpers/get-tag-allowed-values';

const action = 'remove_conversation_tag';

const options = {
  conversationId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontConversationAllowedValues,
  },
  tagIds: {
    type: { type: 'list', element_type: 'string' },
    required: true,
    get_allowed_values: getFrontTagAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    conversationId: { type: 'string' },
    tagIds: { type: { type: 'list', element_type: 'string' } },
  },
} satisfies TQoreResponseType;

const removeFrontConversationTag = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, conversationId, tagIds } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['conversationId', 'tagIds'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    try {
      const body = {
        tag_ids: tagIds,
      };

      await frontApiClient({
        token,
        path: `conversations/${conversationId}/tags`,
        method: 'DELETE',
        body,
      });

      return {
        success: true,
        conversationId,
        tagIds,
      };
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default removeFrontConversationTag;
