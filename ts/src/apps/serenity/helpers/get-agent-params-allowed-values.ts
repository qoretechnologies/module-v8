import {
  IQoreAllowedValue,
  QorusRequest,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { TSerenityAgent, TSerenityAgentsResponse } from './get-agent-allowed-values';
import { Debugger } from '../../../utils/Debugger';
import { SERENITY_CONN_OPTIONS } from '../constants';

// TODO: Update if agent endpoint appears in the future
const getSerenityAgent = async (
  apiKey: string,
  agentCode: string
): Promise<TSerenityAgent | null> => {
  try {
    const response = await QorusRequest.get<TSerenityAgentsResponse>(
      {
        path: '/api/v2/agent',
        headers: {
          'X-API-KEY': apiKey,
        },
        params: {
          page: '1',
          term: agentCode,
        },
      },
      {
        url: `https://api.serenitystar.ai`,
        endpointId: 'Serenity',
      }
    );

    const responseData = response?.data;

    if (!responseData) {
      throw new Error('Failed to get Serenity agent');
    }

    return responseData.items?.[0] || null;
  } catch (error) {
    Debugger.log('Failed to get Serenity activity agent allowed values', error);

    return null;
  }
};

const extractParameters = (templateString: string): string[] => {
  const paramRegex = /\{\{([^{}]+)\}\}/g;
  const matches = templateString.matchAll(paramRegex);

  const params: string[] = [];
  for (const match of matches) {
    const paramName = match[1].trim();
    if (!params.includes(paramName)) {
      params.push(paramName);
    }
  }

  return params;
};

export const getSerenityAgentParamsAllowedValues: TQoreGetAllowedValuesFunction<
  typeof SERENITY_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const apiKey = context?.conn_opts?.apiKey;
  const agentCode = context?.opts?.agentCode;

  const missingValues: string[] = [];

  if (!apiKey) missingValues.push('apiKey');
  if (!agentCode) missingValues.push('agentCode');

  if (missingValues.length > 0) {
    throw new Error(
      `The following values are required: [ ${missingValues.join(', ')} ] to get the agent params allowed values`
    );
  }

  try {
    const agent = await getSerenityAgent(apiKey!, agentCode);

    if (!agent || !agent.ask) {
      return [];
    }

    return extractParameters(agent.ask).map((param) => ({ value: param, display_name: param }));
  } catch (error) {
    Debugger.log('Failed to get Serenity agent params allowed values', error);

    return [];
  }
};
