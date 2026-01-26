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
import { FrontConversationResponseType } from '../response-types/conversation';

const action = 'search_conversations';

const options = {
  query: {
    type: 'string',
    required: true,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 25,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    total: { type: 'integer' },
    conversations: { type: { type: 'list', element_type: FrontConversationResponseType } },
  },
} satisfies TQoreResponseType;

const searchFrontConversations = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, query } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['query'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    const { limit } = obj || {};

    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await frontClient.get<{
        _total: number;
        _results: Record<string, any>[];
      }>(`conversations/search/${encodedQuery}`, {
        token,
        params: {
          limit: limit || 25,
        },
      });

      return {
        total: response._total || 0,
        conversations: formatFrontResponse(response._results || []),
      };
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default searchFrontConversations;
