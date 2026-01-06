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
import { getFrontInboxAllowedValues } from '../helpers/get-inbox-allowed-values';
import { FrontConversationResponseType } from '../response-types/conversation';

const action = 'list_conversations';

const options = {
  inboxId: {
    type: 'string',
    required: false,
    get_allowed_values: getFrontInboxAllowedValues,
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
  limit: {
    type: 'integer',
    required: false,
    default_value: 50,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'list',
  element_type: FrontConversationResponseType,
} satisfies TQoreResponseType;

const listFrontConversations = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    const { inboxId, status, limit } = obj || {};

    try {
      const path = inboxId ? `inboxes/${inboxId}/conversations` : 'conversations';
      const params: Record<string, any> = {};

      if (status) {
        params.q = `[{"and":[{"field":"statuses","match":"any","values":["${status}"]}]}]`;
      }

      const conversations = await frontClient.fetchPaginated<Record<string, any>>({
        path,
        token,
        maxResults: limit || 50,
        params,
      });

      return formatFrontResponse(conversations);
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listFrontConversations;
