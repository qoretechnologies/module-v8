import {
  IQoreAllowedValue,
  QorusRequest,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { SERENITY_CONN_OPTIONS } from '../constants';

const SERENITY_AGENT_TYPES: Record<number, string> = {
  0: 'Activity',
  1: 'Proxy',
  2: 'Chat Completion',
  3: 'Plan',
  4: 'Assistant',
  5: 'Copilot',
} as const;

const SERENITY_SYSTEM_AGENT_TYPES = [0, 1, 2, 3];
const SERENITY_CONVERSATION_AGENT_TYPES = [4, 5];

export type TSerenityAgent = {
  id: string;
  name: string;
  code: string;
  ask: string;
  agentType: number;
};

export type TSerenityAgentsResponse = {
  data: { items: TSerenityAgent[]; total: number };
};

const mapSerenityAgent = (agent: TSerenityAgent): IQoreAllowedValue<string> => ({
  value: agent.code,
  display_name: agent.name,
  desc: `Type: ${SERENITY_AGENT_TYPES[agent.agentType] || 'Unknown'}\n\nCode: ${agent.code}`,
});

const getSerenityAgents = async (token: string, page = 1): Promise<TSerenityAgent[]> => {
  try {
    const response = await QorusRequest.get<TSerenityAgentsResponse>(
      {
        path: '/api/v2/agent',
        headers: {
          'X-API-KEY': token,
        },
        params: {
          pageSize: '100',
          page: page.toString(),
        },
      },
      {
        url: `https://api.serenitystar.ai`,
        endpointId: 'Serenity',
      }
    );

    const responseData = response?.data;

    if (!responseData) {
      throw new Error('Failed to get Serenity activity agent allowed values');
    }

    return responseData.items;
  } catch (error) {
    Debugger.log('Failed to get Serenity activity agent allowed values', error);

    return [];
  }
};

const createGetSerenityAgentAllowedValues =
  (agentTypes: number[]): TQoreGetAllowedValuesFunction<typeof SERENITY_CONN_OPTIONS, string> =>
  async (context) => {
    const token = context?.conn_opts?.token;

    if (!token) {
      throw new Error('Token is required to get Serenity activity agent allowed values');
    }

    const agents: IQoreAllowedValue<string>[] = [];
    let page = 1;
    let serenityAgents = await getSerenityAgents(token, page);

    while (serenityAgents.length) {
      serenityAgents.reduce((acc, agent) => {
        if (agentTypes.includes(agent.agentType)) {
          acc.push(mapSerenityAgent(agent));
        }

        return acc;
      }, agents);

      serenityAgents = await getSerenityAgents(token, ++page);
    }

    return agents;
  };

export const getSerenitySystemAgentAllowedValues = createGetSerenityAgentAllowedValues(
  SERENITY_SYSTEM_AGENT_TYPES
);

export const getSerenityConversationAgentAllowedValues = createGetSerenityAgentAllowedValues(
  SERENITY_CONVERSATION_AGENT_TYPES
);
