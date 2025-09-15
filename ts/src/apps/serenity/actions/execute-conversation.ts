import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreMappedOptions,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getSerenityConversationAgentAllowedValues } from '../helpers/get-agent-allowed-values';
import { getSerenityConversationAllowedValues } from '../helpers/get-conversation-allowed-values';
import { SERENITY_APP_NAME } from '../constants';

const options = {
  agentCode: {
    required: true,
    type: 'string',
    on_change: ['refetch'],
    get_allowed_values: getSerenityConversationAgentAllowedValues,
  },
  conversationId: {
    required: true,
    type: 'string',
    depends_on: ['agentCode'],
    get_allowed_values: getSerenityConversationAllowedValues,
  },
  userLanguage: {
    required: false,
    type: 'string',
    preselected: true,
    default_value: 'en',
  },
  message: {
    required: true,
    type: 'string',
  },
  culture: {
    required: false,
    type: 'string',
    allowed_values: [
      { display_name: 'EN', value: 'en' },
      { display_name: 'ES', value: 'es' },
    ],
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    content: {
      type: 'string',
    },
    jsonContent: {
      type: 'hash',
    },
    completionUsage: {
      type: {
        type: 'hash',
        fields: {
          completionTokens: {
            type: 'number',
          },
          promptTokens: {
            type: 'number',
          },
          totalTokens: {
            type: 'number',
          },
        },
      },
    },
    actionResults: {
      type: 'hash',
    },
    metaAnalysis: {
      type: 'hash',
    },
    instanceId: {
      type: 'string',
    },
    executorTaskLogs: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            description: {
              type: 'string',
            },
            duration: {
              type: 'number',
            },
            success: {
              type: 'boolean',
            },
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;

const ExecuteSerenityConversation = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'execute-conversation',
  app: SERENITY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const agentCode = data?.agentCode;
    const userLanguage = data?.userLanguage;
    const conversationId = data?.conversationId;
    const message = data?.message;
    const culture = data?.culture;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');
    if (!agentCode) missingValues.push('agentCode');
    if (!conversationId) missingValues.push('conversationId');
    if (!message) missingValues.push('message');

    if (missingValues.length > 0) {
      throw new Error(
        `The following values are required: [ ${missingValues.join(', ')} ] to execute the conversation`
      );
    }

    const body = [
      { Key: 'chatId', Value: conversationId },
      { Key: 'userLanguage', Value: userLanguage },
      { Key: 'message', Value: message },
    ];

    const response = await QorusRequest.post<{
      data: TQoreMappedOptions<typeof response_type.fields>;
    }>(
      {
        path: `/api/v2/agent/${agentCode}/execute`,
        headers: {
          'X-API-KEY': token!,
        },
        data: body,
        ...(culture ? { params: { culture } } : {}),
      },
      {
        url: `https://api.serenitystar.ai`,
        endpointId: 'Serenity',
      }
    );

    return response?.data;
  },
  options,
  response_type,
});

export default ExecuteSerenityConversation;
