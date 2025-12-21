import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { HELPSCOUT_APP_NAME, HelpScoutError } from '../constants';
import { fetchHelpScoutPaginatedRecords } from '../helpers/constants';
import { formatHelpScoutResponse } from '../helpers/format-response';
import { getHelpScoutConversationAllowedValues } from '../helpers/get-conversation-allowed-values';
import { HelpScoutThreadResponseType } from '../response-types/conversation';

const action = 'list_threads';

const options = {
  conversationId: {
    type: 'integer',
    required: true,
    get_allowed_values: getHelpScoutConversationAllowedValues,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 50,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'list',
  element_type: HelpScoutThreadResponseType,
} satisfies TQoreResponseType;

const listHelpScoutThreads = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { limit } = obj || {};

    try {
      const threads = await fetchHelpScoutPaginatedRecords<any, Record<string, any>>({
        token,
        path: `conversations/${conversationId}/threads`,
        method: 'GET',
        object: 'threads',
        maxResults: limit || 50,
      });

      return formatHelpScoutResponse(threads);
    } catch (error) {
      throw new HelpScoutError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listHelpScoutThreads;
