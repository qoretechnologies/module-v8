import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { XeroError } from '../constants';
import { getTenantIdRequired, getTokenRequired, getXeroAllowedValues } from './constants';

type XeroBankTransaction = {
  BankTransactionID: string;
  Type: string;
  Status: string;
  Reference?: string;
  IsReconciled: boolean;
  Date: string;
  Total: number;
  CurrencyCode: string;
  BankAccount: {
    AccountID: string;
    Code: string;
    Name: string;
  };
  Contact?: {
    ContactID: string;
    Name: string;
  };
};

const mapXeroBankTransactionToAllowedValue = (
  transaction: XeroBankTransaction
): IQoreAllowedValue<string> => ({
  display_name: transaction.Reference || `${transaction.Type} - ${transaction.Date}`,
  value: transaction.BankTransactionID,
  desc:
    `Type: ${transaction.Type}\n\n` +
    `Status: ${transaction.Status}\n\n` +
    `Date: ${transaction.Date}\n\n` +
    `Total: ${transaction.Total} ${transaction.CurrencyCode}\n\n` +
    `Bank Account: ${transaction.BankAccount?.Name || 'Unknown'}\n\n` +
    `Reconciled: ${transaction.IsReconciled ? 'Yes' : 'No'}\n\n` +
    `Contact: ${transaction.Contact?.Name || 'N/A'}`,
});

export const getXeroBankTransactionIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const token = getTokenRequired(context);
    const tenantId = getTenantIdRequired(context);

    return await getXeroAllowedValues({
      token,
      tenantId,
      path: 'BankTransactions',
      dataPath: 'BankTransactions',
      mapItemToAllowedValue: mapXeroBankTransactionToAllowedValue,
    });
  } catch (error) {
    throw new XeroError(`Couldn't fetch Xero bank transaction IDs: ${error}`);
  }
};
