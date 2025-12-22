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

const action = 'add_note';

export const HelpScoutConversationStatusAllowedValues = [
  { display_name: 'Active', value: 'active' },
  { display_name: 'Closed', value: 'closed' },
  { display_name: 'Open', value: 'open' },
  { display_name: 'Pending', value: 'pending' },
  { display_name: 'Spam', value: 'spam' },
];

const options = {
  conversationId: {
    type: 'integer',
    required: true,
    get_allowed_values: getHelpScoutConversationAllowedValues,
    allowed_values_creatable: true,
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
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    conversationId: { type: 'integer' },
    note: {
      type: {
        type: 'hash',
        fields: {
          noteId: { type: 'integer' },
          text: { type: 'string' },
          user: { type: 'integer' },
          status: { type: 'string' },
        },
      },
    },
  },
} satisfies TQoreResponseType;

const addHelpScoutNote = QoreAppCreator.createLocalizedAction<typeof options>({
  app: HELPSCOUT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, conversationId, text } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['conversationId', 'text'],
      connectionFields: ['token'],
      ErrorClass: HelpScoutError,
    });

    const { user, status } = obj || {};

    try {
      const body: Record<string, any> = {
        text,
        ...(user && { user }),
        ...(status && { status }),
      };

      const { headers } = await helpScoutApiClient<{
        headers: { 'resource-id': string };
      }>({
        token,
        path: `conversations/${conversationId}/notes`,
        getHeaderValues: true,
        method: 'POST',
        body,
      });

      return {
        conversationId,
        note: { ...body, noteId: parseInt(headers['resource-id'], 10) },
      };
    } catch (error) {
      throw new HelpScoutError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default addHelpScoutNote;
