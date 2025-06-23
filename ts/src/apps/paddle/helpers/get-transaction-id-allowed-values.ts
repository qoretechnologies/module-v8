import { Transaction } from '@paddle/paddle-node-sdk';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { PaddleError } from '../constants';
import { createPaddleClient } from './constants';

const mapPaddleItemToAllowedValue = (item: Transaction): IQoreAllowedValue<string> => {
  const total = item.details?.totals?.total;
  const totalNumber = total ? (Number(total) / 100).toFixed(2) : 0;

  return {
    value: item.id,
    display_name: `${item.invoiceNumber}[${item.status}] - ${totalNumber} ${item.currencyCode}`,
    desc:
      `Id: ${item.id}\n` +
      `Origin: ${item.origin}\n` +
      `Status: ${item.status}\n` +
      `Invoice Number: ${item.invoiceNumber}\n` +
      `Total: ${totalNumber}\n` +
      `Currency Code: ${item.currencyCode}\n`,
  };
};

export const getPaddleTransactionIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type'],
    ErrorClass: PaddleError,
  });

  const client = createPaddleClient(token, instance_type);

  const allTransactions: Transaction[] = [];
  const transactionCollection = client.transactions.list();

  try {
    for await (const transaction of transactionCollection) {
      allTransactions.push(transaction);
    }
  } catch (error) {
    console.error(`Failed to fetch transactions: ${error}`);
  }

  return allTransactions.map(mapPaddleItemToAllowedValue);
};
