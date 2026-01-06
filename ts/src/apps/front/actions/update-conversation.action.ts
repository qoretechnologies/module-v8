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
import { getFrontConversationCustomFieldDynamicType } from '../helpers/get-custom-fields';
import { getFrontInboxAllowedValues } from '../helpers/get-inbox-allowed-values';

const action = 'update_conversation';

const options = {
  conversationId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontConversationAllowedValues,
  },
  status: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'open', display_name: 'Open' },
      { value: 'archived', display_name: 'Archived' },
      { value: 'deleted', display_name: 'Deleted' },
      { value: 'spam', display_name: 'Spam' },
    ],
  },
  inboxId: {
    type: 'string',
    required: false,
    get_allowed_values: getFrontInboxAllowedValues,
  },
  customFields: {
    type: 'any',
    required: false,
    get_dynamic_type: getFrontConversationCustomFieldDynamicType,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    conversationId: { type: 'string' },
  },
} satisfies TQoreResponseType;

const updateFrontConversation = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { status, inboxId, customFields } = obj || {};

    try {
      const body: Record<string, any> = {};

      if (status !== undefined) body.status = status;
      if (inboxId !== undefined) body.inbox_id = inboxId;
      if (customFields !== undefined) body.custom_fields = customFields;

      if (Object.keys(body).length === 0) {
        throw new FrontError('At least one field must be provided to update');
      }

      await frontClient.patch(`conversations/${conversationId}`, body, { token });

      return {
        success: true,
        conversationId,
      };
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default updateFrontConversation;
