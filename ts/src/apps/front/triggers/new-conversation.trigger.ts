import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { frontClient } from '../client';
import { FRONT_APP_NAME, FrontError } from '../constants';
import { formatFrontResponse } from '../helpers/format-response';
import { getFrontConversationCustomFieldDynamicResponseType } from '../helpers/get-custom-fields';
import { getFrontInboxAllowedValues } from '../helpers/get-inbox-allowed-values';
import { FrontConversationResponseType } from '../response-types/conversation';

const action = 'new_conversation';

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
} satisfies TQoreOptions;

const NewConversation = QoreAppCreator.createLocalizedTrigger({
  app: FRONT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    const opts = context.opts || {};

    const getItems = () => {
      return fetchLatestRecords({
        token,
        filters: opts,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `front_${action}`,
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: FrontError,
    });

    const records = await fetchLatestRecords({
      token,
      filters: context.opts || {},
    });

    return records?.length > 0 ? records[0] : null;
  },
  event_info: {
    desc: 'Front New Conversation Trigger Event Info',
    type: FrontConversationResponseType,
  },
  get_dynamic_type: async (context) => {
    const customFields = await getFrontConversationCustomFieldDynamicResponseType(context);

    return {
      type: 'hash',
      fields: {
        ...FrontConversationResponseType.fields,
        custom_fields: customFields as TQoreAppActionOption,
      },
    };
  },
});

export default NewConversation;

type TFetchRowsOptions = {
  token: string;
  filters?: Record<string, any>;
};

const fetchLatestRecords = async (options: TFetchRowsOptions): Promise<Record<string, any>[]> => {
  const { token, filters } = options;
  const limit = 20;

  try {
    const { inboxId, status } = filters || {};
    const path = inboxId ? `inboxes/${inboxId}/conversations` : 'conversations';
    const params: Record<string, any> = {
      sort_by: 'created_at',
      sort_order: 'desc',
    };

    if (status) {
      params.q = `[{"and":[{"field":"statuses","match":"any","values":["${status}"]}]}]`;
    }

    const conversations = await frontClient.fetchPaginated<Record<string, any>>({
      path,
      token,
      maxResults: limit,
      params,
    });

    return formatFrontResponse(conversations);
  } catch (error) {
    throw new FrontError(`Failed to fetch latest conversations: ${error.message || error}`);
  }
};
