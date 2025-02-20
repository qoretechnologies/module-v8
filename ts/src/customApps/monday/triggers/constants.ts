import { TWebhookDeregisterFunction } from '@qoretechnologies/ts-toolkit';
import { callMondayAPI, TMondayApiDynamicOptions } from '../actions/constants';

type TQoreBoardItemsResponse = {
  data: {
    boards: {
      id: string;
      name: string;
      items_page: {
        cursor: string;
        items: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        }[];
      };
    }[];
  };
};

type TQoreMondayGetBoardItemsOptions = {
  boardId: string;
  limit?: number;
  token: string;
  url: string;
  orderBy: 'created_at' | 'updated_at';
  orderDirection: 'asc' | 'desc';
};

type TRegisterMondayWebhookOptions<
  TVariables = {
    [key: string]: any;
  },
> = {
  token: string;
  apiUrl: string;
  event: string;
  variables: TVariables;
};

export const registerMondayWebhook = async <
  TVariables = {
    [key: string]: any;
  },
>(
  options: TRegisterMondayWebhookOptions<TVariables>
): Promise<{ webhook: { id: string } }> => {
  const { token, apiUrl, variables, event } = options;

  const query = `
    mutation CreateWebhook($boardId: ID!, $url: String!, $config: JSON!) {
    create_webhook(
      board_id: $boardId,
      url: $url,
      event: ${event},
      config: $config
    ) {
        id
        board_id
        event
      }
    }
  `;

  try {
    const result = await callMondayAPI<{ data: { create_webhook: { id: string } } }>({
      token,
      query,
      variables: variables as TMondayApiDynamicOptions,
      url: apiUrl,
    });

    const webhookId = result?.data?.create_webhook?.id;

    if (!webhookId) {
      throw new Error(`Couldn't register the monday webhook`);
    }

    return {
      webhook: {
        id: webhookId,
      },
    };
  } catch (error) {
    throw new Error(`Couldn't register the monday webhook: ${error}`);
  }
};

export const deregisterMondayWebhook: TWebhookDeregisterFunction = async (
  context,
  _url,
  regInfo
) => {
  const token = context.conn_opts?.token;
  const url = context.conn_opts?.url;
  const webhookId = regInfo?.webhook.id;

  if (!token || !webhookId || !url) {
    throw new Error(`The token and webhook id are required to deregister the monday webhook`);
  }

  const query = `
    mutation DeleteWebhook($webhookId: ID!) {
      delete_webhook(id: $webhookId) {
        id
      }
    }
  `;

  try {
    await callMondayAPI({
      token,
      query,
      url,
      variables: { webhookId },
    });
  } catch (error) {
    throw new Error(`Couldn't deregister the monday webhook: ${error}`);
  }
};

export const getMondayBoardItems = async (options: TQoreMondayGetBoardItemsOptions) => {
  const { boardId, token, url } = options;

  const query = `
      query GetAllBoard($boardId: [ID!]!){
      boards(ids: $boardId) {
        items_page(query_params: {
          order_by: [
            { 
                column_id: ${options.orderBy === 'created_at' ? '__creation_log__' : '__last_updated__'}, 
                direction: ${options.orderDirection} 
            }
          ]
        }) {
          cursor
          items {
            id
            name
            created_at
            updated_at
          }
        }
      }
    }`;

  const result = await callMondayAPI<TQoreBoardItemsResponse>({
    token,
    query,
    variables: { boardId },
    url,
  });

  const items = result?.data?.boards?.[0]?.items_page?.items;

  if (!items) {
    throw new Error(`Couldn't fetch the items from the monday board`);
  }

  if (options.limit) {
    return items.slice(0, options.limit);
  }

  return items;
};
