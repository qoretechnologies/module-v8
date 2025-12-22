import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { HELPSCOUT_APP_NAME, HelpScoutError } from '../constants';
import { helpScoutApiClient } from '../helpers/constants';
import { getHelpScoutConversationAllowedValues } from '../helpers/get-conversation-allowed-values';
import { getHelpScoutUserAllowedValues } from '../helpers/get-user-allowed-values';
import { HelpScoutConversationStatusAllowedValues } from './create-conversation.action';

const action = 'update_conversation';

const options = {
  conversationId: {
    type: 'integer',
    required: true,
    get_allowed_values: getHelpScoutConversationAllowedValues,
  },
  subject: {
    type: 'string',
    required: false,
  },
  status: {
    type: 'string',
    required: false,
    allowed_values: HelpScoutConversationStatusAllowedValues,
  },
  assignTo: {
    type: 'integer',
    required: false,
    get_allowed_values: getHelpScoutUserAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    conversationId: { type: 'integer' },
  },
} satisfies TQoreResponseType;

const updateHelpScoutConversation = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { subject, status, assignTo } = obj || {};

    try {
      const operations: Array<{ op: string; path: string; value?: any }> = [];

      if (subject !== undefined) {
        operations.push({ op: 'replace', path: '/subject', value: subject });
      }
      if (status !== undefined) {
        operations.push({ op: 'replace', path: '/status', value: status });
      }
      if (assignTo !== undefined) {
        operations.push({ op: 'replace', path: '/assignTo', value: assignTo });
      }

      if (operations.length === 0) {
        throw new HelpScoutError('At least one field must be provided to update');
      }

      await helpScoutApiClient({
        token,
        path: `conversations/${conversationId}`,
        method: 'PATCH',
        body: operations?.length > 1 ? operations : operations[0],
      });

      return {
        success: true,
        conversationId,
      };
    } catch (error) {
      throw new HelpScoutError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default updateHelpScoutConversation;
