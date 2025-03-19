import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreMappedOptions,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { SERENITY_APP_NAME } from '../constants';
import { getSerenityConversationAgentAllowedValues } from '../helpers/get-agent-allowed-values';

const options = {
  agentCode: {
    required: true,
    type: 'string',
    get_allowed_values: getSerenityConversationAgentAllowedValues,
  },
  userIdentifier: {
    required: false,
    type: 'string',
  },
  inputParameters: {
    required: false,
    type: {
      type: 'hash',
      fields: {
        key: {
          type: 'string',
          required: true,
        },
        value: {
          type: 'string',
          required: true,
        },
      },
    },
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {},
} satisfies TQoreResponseType;

export const CreateSerenityConversation = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'create-conversation',
  app: SERENITY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const apiKey = context?.conn_opts?.apikey;
    const agentCode = data?.agentCode;
    const parameters = data?.inputParameters || [];
    const userIdentifier = data?.userIdentifier;

    const missingValues: string[] = [];

    if (!apiKey) {
      missingValues.push('apiKey');
    }

    if (!agentCode) {
      missingValues.push('agentCode');
    }

    if (missingValues.length) {
      throw new Error(
        `All of the following: ${missingValues.join(', ')} are required to create a Serenity conversation`
      );
    }

    const body: Record<string, any> = {};

    if (parameters?.length) {
      body.inputParameters = parameters;
    }

    if (userIdentifier) {
      body.userIdentifier = userIdentifier;
    }

    const response = await QorusRequest.post<{
      data: TQoreMappedOptions<typeof response_type.fields>;
    }>(
      {
        path: `/api/v2/agent/${agentCode}/conversation`,
        data: body,
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey!,
        },
      },
      { endpointId: 'serenity', url: 'https://api.serenitystar.ai' }
    );

    return response?.data;
  },
  options,
  response_type,
});
