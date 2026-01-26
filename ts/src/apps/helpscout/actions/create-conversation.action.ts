import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { HELPSCOUT_APP_NAME, HelpScoutError } from '../constants';
import { helpScoutApiClient } from '../helpers/constants';
import { getHelpScoutCustomerAllowedValues } from '../helpers/get-customer-allowed-values';
import { getHelpScoutMailboxAllowedValues } from '../helpers/get-mailbox-allowed-values';
import { getHelpScoutTagNameAllowedValues } from '../helpers/get-tag-name-allowed-values';
import { getHelpScoutUserAllowedValues } from '../helpers/get-user-allowed-values';

const action = 'create_conversation';

export const HelpScoutConversationTypeAllowedValues = [
  { display_name: 'Email', value: 'email' },
  { display_name: 'Phone', value: 'phone' },
  { display_name: 'Chat', value: 'chat' },
];

export const HelpScoutConversationStatusAllowedValues = [
  { display_name: 'Active', value: 'active' },
  { display_name: 'Closed', value: 'closed' },
  { display_name: 'Pending', value: 'pending' },
];

export const HelpScoutThreadTypeAllowedValues = [
  { display_name: 'Customer', value: 'customer' },
  { display_name: 'Note', value: 'note' },
  { display_name: 'Reply', value: 'reply' },
  { display_name: 'Phone', value: 'phone' },
  { display_name: 'Chat', value: 'chat' },
];

const options = {
  subject: {
    type: 'string',
    required: true,
  },
  mailboxId: {
    type: 'integer',
    required: true,
    get_allowed_values: getHelpScoutMailboxAllowedValues,
  },
  type: {
    type: 'string',
    required: true,
    allowed_values: HelpScoutConversationTypeAllowedValues,
    default_value: 'email',
  },
  status: {
    type: 'string',
    required: true,
    allowed_values: HelpScoutConversationStatusAllowedValues,
    default_value: 'active',
  },
  customerId: {
    type: 'integer',
    required: false,
    get_allowed_values: getHelpScoutCustomerAllowedValues,
    required_groups: ['customer'],
  },
  customerEmail: {
    type: 'string',
    required: false,
    required_groups: ['customer'],
  },
  threadType: {
    type: 'string',
    required: true,
    allowed_values: HelpScoutThreadTypeAllowedValues,
    default_value: 'customer',
  },
  threadText: {
    type: 'string',
    required: true,
  },
  assignTo: {
    type: 'integer',
    required: false,
    get_allowed_values: getHelpScoutUserAllowedValues,
  },
  tags: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getHelpScoutTagNameAllowedValues,
    element_allowed_values_creatable: true,
    required: false,
  },
  autoReply: {
    type: 'bool',
    required: false,
    default_value: false,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    conversationId: { type: 'integer' },
  },
} satisfies TQoreResponseType;

const createHelpScoutConversation = QoreAppCreator.createLocalizedAction<typeof options>({
  app: HELPSCOUT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { token, subject, mailboxId, type, status, threadType, threadText } =
      getQoreContextRequiredValues({
        context: { ...context, opts: obj },
        optionFields: ['subject', 'mailboxId', 'type', 'status', 'threadType', 'threadText'],
        connectionFields: ['token'],
        ErrorClass: HelpScoutError,
      });

    const { customerId, customerEmail, assignTo, tags, autoReply } = obj || {};

    if (!customerId && !customerEmail) {
      throw new HelpScoutError('Either customerId or customerEmail must be provided');
    }

    try {
      const customer: Record<string, any> = {};
      if (customerId) {
        customer.id = customerId;
      } else if (customerEmail) {
        customer.email = customerEmail;
      }

      const body: Record<string, any> = {
        subject,
        mailboxId,
        type,
        status,
        customer,
        threads: [
          {
            type: threadType,
            text: threadText,
            customer,
          },
        ],
        ...(assignTo && { assignTo }),
        ...(tags && tags.length > 0 && { tags }),
        ...(autoReply !== undefined && { autoReply }),
      };

      const { headers } = await helpScoutApiClient<{ headers: { 'resource-id': string } }>({
        token,
        path: 'conversations',
        method: 'POST',
        getHeaderValues: true,
        body,
      });

      return {
        conversationId: parseInt(headers['resource-id'], 10),
      };
    } catch (error) {
      throw new HelpScoutError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default createHelpScoutConversation;
