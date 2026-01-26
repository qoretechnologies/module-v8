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

const action = 'list_users';

const options = {
  email: {
    type: 'string',
    required: false,
  },
  mailbox: {
    type: 'integer',
    required: false,
    get_allowed_values: getHelpScoutMailboxAllowedValues,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 50,
  },
} satisfies TQoreOptions;

const HelpScoutUserResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'integer' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
    role: { type: 'string' },
    timezone: { type: 'string' },
    photoUrl: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    type: { type: 'string' },
    mention: { type: 'string' },
    initials: { type: 'string' },
    jobTitle: { type: 'string' },
    phone: { type: 'string' },
    alternateEmails: {
      type: {
        type: 'list',
        element_type: 'string',
      },
    },
  },
} satisfies TQoreResponseType;

const responseType = {
  type: 'list',
  element_type: HelpScoutUserResponseType,
} satisfies TQoreResponseType;

const listHelpScoutUsers = QoreAppCreator.createLocalizedAction<typeof options>({
  app: HELPSCOUT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: HelpScoutError,
    });

    const { email, mailbox, limit } = obj || {};

    try {
      const params: Record<string, string> = {};

      if (email) params.email = email;
      if (mailbox) params.mailbox = String(mailbox);

      return await fetchHelpScoutPaginatedRecords({
        token,
        path: 'users',
        method: 'GET',
        object: 'users',
        params,
        maxResults: limit || 50,
      });
    } catch (error) {
      throw new HelpScoutError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listHelpScoutUsers;
