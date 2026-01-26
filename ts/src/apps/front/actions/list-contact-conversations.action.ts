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
import { getFrontContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { FrontConversationResponseType } from '../response-types/conversation';

const action = 'list_contact_conversations';

const options = {
  contactId: {
    type: 'string',
    required: true,
    get_allowed_values: getFrontContactAllowedValues,
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

const listFrontContactConversations = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, contactId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['contactId'],
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    const { limit } = obj || {};

    try {
      const conversations = await frontClient.fetchPaginated<Record<string, any>>({
        path: `contacts/${contactId}/conversations`,
        token,
        maxResults: limit || 50,
      });

      return formatFrontResponse(conversations);
    } catch (error) {
      throw new FrontError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listFrontContactConversations;
