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
import { getHelpScoutCustomerAllowedValues } from '../helpers/get-customer-allowed-values';
import { getHelpScoutUserAllowedValues } from '../helpers/get-user-allowed-values';
import { HelpScoutConversationStatusAllowedValues } from './add-note.action';

const action = 'send_reply';

const options = {
  conversationId: {
    type: 'integer',
    required: true,
    get_allowed_values: getHelpScoutConversationAllowedValues,
    allowed_values_creatable: true,
  },
  customerId: {
    type: 'integer',
    required: true,
    get_allowed_values: getHelpScoutCustomerAllowedValues,
  },
  text: {
    type: 'string',
    required: true,
  },
  user: {
    type: 'integer',
    required: false,
    get_allowed_values: getHelpScoutUserAllowedValues,
  },
  status: {
    type: 'string',
    required: false,
    allowed_values: HelpScoutConversationStatusAllowedValues,
  },
  draft: {
    type: 'bool',
    required: false,
    default_value: false,
  },
  cc: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
  },
  bcc: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
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
    replyId: { type: 'integer' },
  },
} satisfies TQoreResponseType;

const sendHelpScoutReply = QoreAppCreator.createLocalizedAction<typeof options>({
  app: HELPSCOUT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, conversationId, customerId, text } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['conversationId', 'customerId', 'text'],
      connectionFields: ['token'],
      ErrorClass: HelpScoutError,
    });

    const { user, status, draft, cc, bcc, assignTo } = obj || {};

    try {
      const body: Record<string, any> = {
        customer: { id: customerId },
        text,
        ...(user && { user }),
        ...(status && { status }),
        ...(draft !== undefined && { draft }),
        ...(cc && cc.length > 0 && { cc }),
        ...(bcc && bcc.length > 0 && { bcc }),
        ...(assignTo && { assignTo }),
      };

      const {
        headers: { 'resource-id': replyId },
      } = await helpScoutApiClient<{
        headers: { 'resource-id': string };
      }>({
        token,
        path: `conversations/${conversationId}/reply`,
        method: 'POST',
        getHeaderValues: true,
        body,
      });

      return {
        success: true,
        conversationId,
        replyId: parseInt(replyId, 10),
      };
    } catch (error) {
      throw new HelpScoutError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default sendHelpScoutReply;
