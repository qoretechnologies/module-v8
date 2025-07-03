import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { CreditMemo } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import {
  createQuickbooksClient,
  QUICKBOOKS_ALLOWED_VALUES_LIMIT,
  QUICKBOOKS_ALLOWED_VALUES_TIMEOUT,
} from './constants';

const mapQuickbooksCreditMemoToAllowedValue = (
  creditMemo: CreditMemo
): IQoreAllowedValue<string> => {
  const customerName = creditMemo.CustomerRef?.name || 'Unknown Customer';
  const totalAmount = creditMemo.TotalAmt || 0;
  const txnDate = creditMemo.TxnDate || 'No transaction date';
  const docNumber = creditMemo.DocNumber || 'No document number';
  const balance = creditMemo.Balance || 0;

  return {
    value: creditMemo.Id!,
    display_name: `${customerName} - $${totalAmount} (${docNumber})`,
    desc:
      `Customer: ${customerName}\n` +
      `Amount: $${totalAmount}\n` +
      `Balance: $${balance}\n` +
      `Date: ${txnDate}\n` +
      `Doc Number: ${docNumber}`,
  };
};

export const getQuickbooksCreditMemoIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, realm_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'realm_id'],
    ErrorClass: QuickbooksError,
  });

  const client = createQuickbooksClient({ token, instance_type, realm_id });

  const allCreditMemos: CreditMemo[] = [];
  let total = 0;
  const start = Date.now();

  try {
    const creditMemos = await client.findCreditMemos({
      desc: 'MetaData.CreateTime',
    });

    allCreditMemos.push(...(creditMemos.QueryResponse.CreditMemo || []));
    total = creditMemos.QueryResponse.maxResults || 0;

    while (
      allCreditMemos.length <= QUICKBOOKS_ALLOWED_VALUES_LIMIT &&
      allCreditMemos.length <= total &&
      Date.now() - start < QUICKBOOKS_ALLOWED_VALUES_TIMEOUT
    ) {
      const creditMemos = await client.findCreditMemos({
        desc: 'MetaData.CreateTime',
        offset: allCreditMemos.length,
      });

      allCreditMemos.push(...(creditMemos.QueryResponse.CreditMemo || []));
      total = creditMemos.QueryResponse.maxResults || 0;
    }
  } catch (error) {
    console.error(`Failed to fetch credit memos: ${error}`);
  }

  return allCreditMemos.map(mapQuickbooksCreditMemoToAllowedValue);
};
