import { TWebhookDeregisterFunction } from '@qoretechnologies/ts-toolkit';
import {
  callMondayAPI,
  formatMondayRecordResponse,
  TMondayApiDynamicOptions,
} from '../helpers/constants';
import { TMondayItemsPageResponse } from '../helpers/record-based/constants';

type TQoreMondayGetBoardItemsOptions = {
  boardId: string;
  groupId?: string;
  limit?: number;
  token: string;
  orderBy: 'created_at' | 'updated_at';
  orderDirection: 'asc' | 'desc';
};

type TRegisterMondayWebhookOptions<
  TVariables = {
    [key: string]: any;
  },
> = {
  token: string;
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
  const { token, variables, event } = options;

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
  const webhookId = regInfo?.webhook.id;

  if (!token || !webhookId) {
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
      variables: { webhookId },
    });
  } catch (error) {
    throw new Error(`Couldn't deregister the monday webhook: ${error}`);
  }
};

export const getMondayBoardItems = async (options: TQoreMondayGetBoardItemsOptions) => {
  const { boardId, token, groupId } = options;

  let query = ``;

  const itemsPageFragment = `
          items_page(
            limit: ${options.limit || 100},
            query_params: {
              order_by: [
                { 
                    column_id: ${
                      options.orderBy === 'created_at' ? '"__creation_log__"' : '"__last_updated__"'
                    }, 
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
                column_values {
                  id
                  text
                  value
                  type
                  column {
                    title
                    settings
                  }
                }
              }
            }`;

  if (groupId) {
    query = `
        query {
          boards(ids: ${boardId}) {
            groups(ids: "${groupId}") {${itemsPageFragment}
            }
          }
        }
      `;
  } else {
    query = `
      query {
        boards(ids: ${boardId}) {${itemsPageFragment}
        }
      }
    `;
  }

  const result = await callMondayAPI<TMondayItemsPageResponse>({
    token,
    query,
    variables: { boardId },
  });

  const itemsPage = groupId
    ? result.data?.boards?.[0]?.groups?.[0]?.items_page
    : result.data?.boards?.[0]?.items_page;

  if (!itemsPage) {
    throw new Error(`Couldn't fetch the items from the monday board`);
  }

  return formatMondayRecordResponse(itemsPage.items);
};
