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
import { getHelpScoutMailboxAllowedValues } from '../helpers/get-mailbox-allowed-values';
import { getHelpScoutTagNameAllowedValues } from '../helpers/get-tag-name-allowed-values';
import { getHelpScoutUserAllowedValues } from '../helpers/get-user-allowed-values';
import { HelpScoutConversationResponseType } from '../response-types/conversation';

const action = 'list_conversations';

export const HelpScoutConversationStatusFilterAllowedValues = [
  { display_name: 'All', value: 'all' },
  { display_name: 'Active', value: 'active' },
  { display_name: 'Closed', value: 'closed' },
  { display_name: 'Open', value: 'open' },
  { display_name: 'Pending', value: 'pending' },
  { display_name: 'Spam', value: 'spam' },
];

export const HelpScoutConversationSortFieldAllowedValues = [
  { display_name: 'Created At', value: 'createdAt' },
  { display_name: 'Customer Email', value: 'customerEmail' },
  { display_name: 'Customer Name', value: 'customerName' },
  { display_name: 'Mailbox ID', value: 'mailboxid' },
  { display_name: 'Modified At', value: 'modifiedAt' },
  { display_name: 'Number', value: 'number' },
  { display_name: 'Status', value: 'status' },
  { display_name: 'Subject', value: 'subject' },
];

export const HelpScoutSortOrderAllowedValues = [
  { display_name: 'Descending', value: 'desc' },
  { display_name: 'Ascending', value: 'asc' },
];

const options = {
  mailbox: {
    type: 'integer',
    required: false,
    get_allowed_values: getHelpScoutMailboxAllowedValues,
  },
  status: {
    type: 'string',
    required: false,
    allowed_values: HelpScoutConversationStatusFilterAllowedValues,
  },
  assignedTo: {
    type: 'integer',
    required: false,
    get_allowed_values: getHelpScoutUserAllowedValues,
  },
  tag: {
    type: 'string',
    required: false,
    get_allowed_values: getHelpScoutTagNameAllowedValues,
  },
  modifiedSince: {
    type: 'date',
    required: false,
  },
  sortField: {
    type: 'string',
    required: false,
    allowed_values: HelpScoutConversationSortFieldAllowedValues,
    default_value: 'createdAt',
  },
  sortOrder: {
    type: 'string',
    required: false,
    allowed_values: HelpScoutSortOrderAllowedValues,
    default_value: 'desc',
  },
  query: {
    type: 'string',
    required: false,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 50,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'list',
  element_type: HelpScoutConversationResponseType,
} satisfies TQoreResponseType;

const listHelpScoutConversations = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { mailbox, status, assignedTo, tag, modifiedSince, sortField, sortOrder, query, limit } =
      obj || {};

    try {
      const params: Record<string, string> = {};

      if (mailbox) params.mailbox = String(mailbox);
      if (status) params.status = status;
      if (assignedTo) params.assigned_to = String(assignedTo);
      if (tag) params.tag = tag;
      if (sortField) params.sortField = sortField;
      if (sortOrder) params.sortOrder = sortOrder;
      if (query) params.query = query;

      if (modifiedSince) {
        const dateStr = new Date(modifiedSince).toISOString();
        params.modifiedSince = dateStr;
      }

      const conversations = await fetchHelpScoutPaginatedRecords<any, Record<string, any>>({
        token,
        path: 'conversations',
        method: 'GET',
        object: 'conversations',
        params,
        maxResults: limit || 50,
      });

      return formatHelpScoutResponse(conversations);
    } catch (error) {
      throw new HelpScoutError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listHelpScoutConversations;
