import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreAppActionFunctionContext,
  TQoreAppActionWithEventOrWebhookEventInfo,
  TQoreMappedOptions,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { SERENITY_APP_NAME } from '../constants';
import { getSerenityConversationAgentAllowedValues } from '../helpers/get-agent-allowed-values';
import { getSerenityConversationAllowedValues } from '../helpers/get-conversation-allowed-values';

const options = {
  agentCode: {
    required: false,
    type: 'string',
    on_change: ['refetch'],
    get_allowed_values: getSerenityConversationAgentAllowedValues,
  },
  conversationId: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getSerenityConversationAllowedValues,
  },
  sender: {
    required: true,
    type: 'string',
    allowed_values: [
      { value: 'user', display_name: 'User' },
      { value: 'bot', display_name: 'Bot' },
      { value: 'all', display_name: 'All' },
    ],
    default_value: 'all',
  },
} satisfies TQoreOptions;

const event_info = {
  desc: 'Serentiy new conversation message event info',
  type: {
    type: 'hash',
    fields: {
      createdAt: { type: 'string' },
      sender: { type: 'string' },
      type: { type: 'string' },
      value: { type: 'string' },
      tokenUsage: {
        type: {
          type: 'hash',
          fields: {
            promptTokens: { type: 'number' },
            completionTokens: { type: 'number' },
          },
        },
      },
    },
  },
} satisfies TQoreAppActionWithEventOrWebhookEventInfo;

const getContextValues = (context: TQoreAppActionFunctionContext) => {
  const apiKey = context.conn_opts?.apiKey;
  const agentCode = context.opts?.agentCode;
  const conversationId = context.opts?.conversationId;
  const sender = context.opts?.sender;

  const missingValues: string[] = [];

  if (!apiKey) missingValues.push('apiKey');
  if (!conversationId) missingValues.push('conversationId');
  if (!sender) missingValues.push('sender');

  if (missingValues.length) {
    throw new Error(
      `All of the following values: [${missingValues.join(', ')}]` +
        ` are required to start the new conversation message Serenity trigger`
    );
  }

  return { apiKey: apiKey!, agentCode, conversationId: conversationId!, sender: sender! };
};

const SerenityNewConversationMessageTrigger = QoreAppCreator.createLocalizedTrigger<typeof options>(
  {
    app: SERENITY_APP_NAME,
    action: 'new-conversation-message',
    options,
    action_code: EQoreAppActionCode.EVENT,
    event_function: async (context, update, should_stop) => {
      const { apiKey, conversationId, sender } = getContextValues(context);
      const getItems = () => {
        return getSerenityConversationMessages(apiKey, conversationId, sender);
      };

      await pollCreatedItemsForTrigger({
        trigger_name: 'serenity_new_conversation_message',
        uniqueField: 'createdAt',
        getItems,
        update,
        should_stop,
      });
    },
    get_example_event_data: async (context) => {
      const { apiKey, conversationId, sender } = getContextValues(context);

      const messages = await getSerenityConversationMessages(apiKey, conversationId, sender);

      return messages?.length > 0 ? messages[0] : null;
    },
    event_info,
  }
);

export default SerenityNewConversationMessageTrigger;

const getSerenityConversationMessages = async (
  apiKey: string,
  conversationId: string,
  sender: string
) => {
  try {
    const response = await QorusRequest.get<{
      data: { messagesJson: string };
    }>(
      {
        path: '/api/v2/conversation',
        headers: {
          'X-API-KEY': apiKey,
        },
        params: {
          id: conversationId,
        },
      },
      { url: `https://api.serenitystar.ai`, endpointId: 'Serenity' }
    );

    const responseData = response?.data;
    const messagesJson = responseData?.messagesJson;
    if (!messagesJson) {
      throw new Error('No data returned for conversation messages');
    }

    let messages = JSON.parse(responseData.messagesJson);

    if (sender !== 'all') {
      messages = messages.filter(
        (message: TQoreMappedOptions<typeof event_info.type.fields>) => message.sender === sender
      );
    }

    const startIndex = Math.max(0, messages.length - DEFAULT_TRIGGER_POLL_ITEM_LIMIT);

    return messages.slice(startIndex);
  } catch (error) {
    throw new Error('Failed to get Serenity conversation messages: ' + error);
  }
};
