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
import { getHelpScoutTagNameAllowedValues } from '../helpers/get-tag-name-allowed-values';

const action = 'add_tags';

const options = {
  conversationId: {
    type: 'integer',
    required: true,
    get_allowed_values: getHelpScoutConversationAllowedValues,
  },
  tags: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getHelpScoutTagNameAllowedValues,
    element_allowed_values_creatable: true,
    required: true,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    conversationId: { type: 'integer' },
    tags: { type: { type: 'list', element_type: 'string' } },
  },
} satisfies TQoreResponseType;

const addHelpScoutTags = QoreAppCreator.createLocalizedAction<typeof options>({
  app: HELPSCOUT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, conversationId, tags } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['conversationId', 'tags'],
      connectionFields: ['token'],
      ErrorClass: HelpScoutError,
    });

    try {
      await helpScoutApiClient({
        token,
        path: `conversations/${conversationId}/tags`,
        method: 'PUT',
        body: { tags },
      });

      return {
        conversationId,
        tags,
      };
    } catch (error) {
      throw new HelpScoutError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default addHelpScoutTags;
