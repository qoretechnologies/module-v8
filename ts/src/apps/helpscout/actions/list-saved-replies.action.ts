import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { HELPSCOUT_APP_NAME, HelpScoutError } from '../constants';
import { fetchHelpScoutPaginatedRecords } from '../helpers/constants';
import { getHelpScoutMailboxAllowedValues } from '../helpers/get-mailbox-allowed-values';

const action = 'list_saved_replies';

const options = {
  mailboxId: {
    type: 'integer',
    required: true,
    get_allowed_values: getHelpScoutMailboxAllowedValues,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 50,
  },
} satisfies TQoreOptions;

const HelpScoutSavedReplyResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'integer' },
    name: { type: 'string' },
    preview: { type: 'string' },
    chatPreview: { type: 'string' },
  },
} satisfies TQoreResponseType;

const responseType = {
  type: 'list',
  element_type: HelpScoutSavedReplyResponseType,
} satisfies TQoreResponseType;

const listHelpScoutSavedReplies = QoreAppCreator.createLocalizedAction<typeof options>({
  app: HELPSCOUT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, mailboxId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['mailboxId'],
      connectionFields: ['token'],
      ErrorClass: HelpScoutError,
    });

    const { limit } = obj || {};

    try {
      return await fetchHelpScoutPaginatedRecords({
        token,
        path: `mailboxes/${mailboxId}/saved-replies`,
        method: 'GET',
        object: 'savedReplies',
        maxResults: limit || 50,
      });
    } catch (error) {
      throw new HelpScoutError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listHelpScoutSavedReplies;
