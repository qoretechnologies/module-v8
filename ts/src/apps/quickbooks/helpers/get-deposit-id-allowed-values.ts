import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Deposit } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import {
  createQuickbooksClient,
  QUICKBOOKS_ALLOWED_VALUES_LIMIT,
  QUICKBOOKS_ALLOWED_VALUES_TIMEOUT,
} from './constants';

const mapQuickbooksDepositToAllowedValue = (deposit: Deposit): IQoreAllowedValue<string> => {
  const totalAmount = deposit.TotalAmt || 0;
  const txnDate = deposit.TxnDate || 'No transaction date';
  const depositToAccount = deposit.DepositToAccountRef?.name || 'Unknown Account';
  const memo = deposit.PrivateNote || '';

  const lineCount = deposit.Line?.length || 0;
  const lineItemsText = lineCount === 1 ? '1 item' : `${lineCount} items`;

  return {
    value: deposit.Id!,
    display_name: `$${totalAmount} to ${depositToAccount} (${txnDate})`,
    desc:
      `Amount: $${totalAmount}\n` +
      `Date: ${txnDate}\n` +
      `Account: ${depositToAccount}\n` +
      `Items: ${lineItemsText}` +
      (memo ? `\nMemo: ${memo}` : ''),
  };
};

export const getQuickbooksDepositIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, realm_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'realm_id'],
    ErrorClass: QuickbooksError,
  });

  const client = createQuickbooksClient({ token, instance_type, realm_id });

  const allDeposits: Deposit[] = [];
  let total = 0;
  const start = Date.now();

  try {
    const deposits = await client.findDeposits({
      desc: 'MetaData.CreateTime',
    });

    allDeposits.push(...(deposits.QueryResponse.Deposit || []));
    total = deposits.QueryResponse.maxResults || 0;

    while (
      allDeposits.length <= QUICKBOOKS_ALLOWED_VALUES_LIMIT &&
      allDeposits.length <= total &&
      Date.now() - start < QUICKBOOKS_ALLOWED_VALUES_TIMEOUT
    ) {
      const deposits = await client.findDeposits({
        desc: 'MetaData.CreateTime',
        offset: allDeposits.length,
      });

      allDeposits.push(...(deposits.QueryResponse.Deposit || []));
      total = deposits.QueryResponse.maxResults || 0;
    }
  } catch (error) {
    console.error(`Failed to fetch deposits: ${error}`);
  }

  return allDeposits.map(mapQuickbooksDepositToAllowedValue);
};
