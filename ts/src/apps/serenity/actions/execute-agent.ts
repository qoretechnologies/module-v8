import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreMappedOptions,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { SERENITY_APP_NAME } from '../constants';
import { getSerenitySystemAgentAllowedValues } from '../helpers/get-agent-allowed-values';
import { getSerenityAgentParamsAllowedValues } from '../helpers/get-agent-params-allowed-values';

const options = {
  agentCode: {
    required: true,
    type: 'string',
    on_change: ['refetch'],
    get_allowed_values: getSerenitySystemAgentAllowedValues,
  },
  culture: {
    required: false,
    type: 'string',
    allowed_values: [
      { display_name: 'EN', value: 'en' },
      { display_name: 'ES', value: 'es' },
    ],
  },
  userLanguage: {
    required: false,
    type: 'string',
    preselected: true,
    default_value: 'en',
  },
  params: {
    required: true,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          key: {
            type: 'string',
            get_allowed_values: getSerenityAgentParamsAllowedValues,
            allowed_values_creatable: true,
            required: true,
          },
          value: {
            type: 'string',
            required: true,
          },
        },
      },
    },
  },
  volatileKnowledgeIds: {
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'string',
      },
    },
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

export const ExecuteSerenityAgent = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'execute-agent',
  app: SERENITY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const apiKey = context?.conn_opts?.apiKey;
    const agentCode = data?.agentCode;
    const culture = data?.culture;
    const params = (data?.params || []) as { Key: string; Value: string }[];
    const volatileKnowledgeIds = data?.volatileKnowledgeIds as string[] | undefined;
    const userLanguage = data?.userLanguage || 'en';

    const missingValues: string[] = [];

    if (!apiKey) {
      missingValues.push('apiKey');
    }

    if (!agentCode) {
      missingValues.push('agentCode');
    }

    if (!params) {
      missingValues.push('params');
    }

    if (missingValues.length) {
      throw new Error(
        `All of the following: ${missingValues.join(', ')} are required to execute a Serenity agent`
      );
    }

    const body = [
      ...params.filter((param) => param.Key !== 'userLanguage'),
      ...(volatileKnowledgeIds?.length ? volatileKnowledgeIds : []),
      { Key: 'userLanguage', Value: userLanguage },
    ];

    const response = await QorusRequest.post<{
      data: TQoreMappedOptions<typeof response_type.fields>;
    }>(
      {
        path: `/api/v2/agent/${agentCode}/execute`,
        data: body,
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey!,
        },
        ...(culture ? { params: { culture } } : {}),
      },
      { endpointId: 'serenity', url: 'https://api.serenitystar.ai' }
    );

    return response?.data;
  },
  options,
  response_type,
});
