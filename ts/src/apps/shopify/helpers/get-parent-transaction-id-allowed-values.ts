import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_CONN_OPTIONS, TShopifyContextWithConn } from '../constants';
import { executeShopifyGraphQL, ShopifyError } from './constants';

export const getShopifyParentTransactionIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof SHOPIFY_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const orderId = context?.opts?.orderId;
  const transactionType = context?.opts?.type;

  if (!orderId) {
    return [];
  }

  try {
    const orderIdNumber = orderId.includes('gid://shopify/Order/')
      ? orderId.match(/gid:\/\/shopify\/Order\/(\d+)/)?.[1] || orderId
      : orderId;

    let hasNextPage = true;
    let afterCursor: string | null = null;
    const allTransactions: any[] = [];

    while (hasNextPage) {
      const query: string = `
        query {
          order(id: "gid://shopify/Order/${orderIdNumber}") {
            transactions(first: 50${afterCursor ? `, after: "${afterCursor}"` : ''}) {
              pageInfo {
                hasNextPage
                endCursor
              }
              edges {
                node {
                  id
                  name
                  status
                  kind
                  gateway
                  amount {
                    amount
                    currencyCode
                  }
                  createdAt
                  processedAt
                  test
                }
              }
            }
          }
        }
      `;

      const response = await executeShopifyGraphQL(context as TShopifyContextWithConn, query);

      const transactions = response.data?.order?.transactions;
      if (!transactions?.edges) {
        break;
      }

      allTransactions.push(...transactions.edges.map((edge: any) => edge.node));

      hasNextPage = transactions.pageInfo?.hasNextPage || false;
      afterCursor = transactions.pageInfo?.endCursor || null;
    }

    let filteredTransactions = allTransactions;

    if (transactionType) {
      switch (transactionType) {
        case 'CAPTURE':
          filteredTransactions = filteredTransactions.filter(
            (txn: any) => txn.kind === 'AUTHORIZATION' && txn.status === 'SUCCESS'
          );
          break;
        case 'VOID':
          filteredTransactions = filteredTransactions.filter(
            (txn: any) => txn.kind === 'AUTHORIZATION' && txn.status === 'SUCCESS'
          );
          break;
        case 'REFUND':
          filteredTransactions = filteredTransactions.filter(
            (txn: any) =>
              (txn.kind === 'CAPTURE' || txn.kind === 'SALE') && txn.status === 'SUCCESS'
          );
          break;
      }
    }

    return filteredTransactions.map((txn: any) => {
      return {
        display_name: `${txn.name || 'Transaction'} - ${txn.amount?.amount} ${txn.amount?.currencyCode || ''}`,
        value: txn.id,
        short_desc:
          `Type: ${txn.kind || 'Unknown'}\n` +
          `Status: ${txn.status || 'Unknown'}\n` +
          `Date: ${new Date(txn.processedAt || txn.createdAt).toLocaleString()}\n` +
          `Gateway: ${txn.gateway || 'Default'}\n` +
          `Test: ${txn.test ? 'Yes' : 'No'}`,
      };
    });
  } catch (error) {
    if (error instanceof ShopifyError) {
      throw error;
    }
    throw new ShopifyError(`Failed to fetch Shopify transactions: ${error.message}`, error);
  }
};
