import {
  IQoreAllowedValue,
  QorusRequest,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { SERENITY_CONN_OPTIONS } from '../constants';
import { Debugger } from '../../../utils/Debugger';

type TSerenityConversation = {
  id: string;
  name: string;
  userIdentifier: string;
};

type TSerenityConversationsResponse = {
  data: { items: TSerenityConversation[]; total: number };
};

const mapSerenityConversation = (
  conversation: TSerenityConversation
): IQoreAllowedValue<string> => ({
  value: conversation.id,
  display_name: conversation.name,
  desc: `User Identifier: ${conversation.userIdentifier}\n\nID: ${conversation.id}`,
});

const getSerenityConversations = async (
  token: string,
  agentCode: string,
  page = 1
): Promise<TSerenityConversation[]> => {
  try {
    const response = await QorusRequest.get<TSerenityConversationsResponse>(
      {
        path: '/api/v2/AgentInstance',
        headers: {
          'X-API-KEY': token,
        },
        params: {
          pageSize: '100',
          code: agentCode,
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

export const getSerenityConversationAllowedValues: TQoreGetAllowedValuesFunction<
  typeof SERENITY_CONN_OPTIONS,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;
  const agentCode = context?.opts?.agentCode;

  const missingValues: string[] = [];

  if (!token) {
    missingValues.push('token');
  }

  if (!agentCode) {
    missingValues.push('agentCode');
  }

  if (missingValues.length > 0) {
    throw new Error(
      `The following values are required: [ ${missingValues.join(', ')} ] to get the conversation allowed values`
    );
  }

  const conversations: IQoreAllowedValue<string>[] = [];
  let page = 1;
  let serenityConversations = await getSerenityConversations(token!, agentCode, page);

  while (serenityConversations.length) {
    conversations.push(...serenityConversations.map(mapSerenityConversation));
    serenityConversations = await getSerenityConversations(token!, agentCode, ++page);
  }

  return conversations;
};
