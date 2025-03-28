import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchMagentoAllowedValues } from '../../magento/helpers/constants';

type TMagentoTransactionData = {
  transaction_id: string;
  parent_id: string;
  order_id: string;
  payment_id: string;
  txn_id: string;
  parent_txn_id: string;
  txn_type: string;
  is_closed: number;
  created_at: string;
  additional_information: {
    method: string;
    amount: string;
    status: string;
  };
};

const mapMagentoTransaction = (
  transaction: TMagentoTransactionData
): IQoreAllowedValue<string> => ({
  display_name: `Transaction #${transaction.txn_id} - ${transaction.txn_type}`,
  value: transaction.transaction_id,
  desc:
    `Created: ${transaction.created_at}\n\n` +
    `Order ID: ${transaction.order_id}\n\n` +
    `Type: ${transaction.txn_type}\n\n` +
    `Status: ${transaction.additional_information?.status || 'Unknown'}\n\n` +
    `Method: ${transaction.additional_information?.method || 'Unknown'}\n\n` +
    `Amount: ${transaction.additional_information?.amount || 'Unknown'}\n\n` +
    `Is Closed: ${transaction.is_closed ? 'Yes' : 'No'}`,
});

export const getMagentoTransactionIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const url = context?.conn_opts?.url;

  const missingValues: string[] = [];

  if (!url) missingValues.push('url');
  if (!token) missingValues.push('token');

  if (missingValues.length) {
    throw new Error(
      `All of the following values are required: ${missingValues.join(', ')}` +
        `to fetch transaction allowed values for Magento`
    );
  }

  const transactions = await fetchMagentoAllowedValues<TMagentoTransactionData>({
    url: url!,
    token: token!,
    mapItemToAllowedValue: mapMagentoTransaction,
    path: '/V1/transactions',
  });

  return transactions;
};
