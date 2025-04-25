import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { XeroError } from '../constants';
import { getTenantIdRequired, getTokenRequired, getXeroAllowedValues } from './constants';

type XeroBankAccount = {
  AccountID: string;
  Code: string;
  Name: string;
  Type: string;
  Status: string;
  BankAccountNumber?: string;
  BankAccountType?: string;
  CurrencyCode?: string;
  BankAccountName?: string;
};

const mapXeroBankAccountToAllowedValue = (account: XeroBankAccount): IQoreAllowedValue<string> => ({
  display_name: `${account.Name}`,
  value: account.AccountID,
  desc:
    `Account Number: ${account.BankAccountNumber || 'N/A'}\n\n` +
    `Account Type: ${account.BankAccountType || 'N/A'}\n\n` +
    `Status: ${account.Status}\n\n` +
    `Currency: ${account.CurrencyCode || 'Default'}\n\n` +
    `Bank Account Name: ${account.BankAccountName || account.Name}`,
});

export const getXeroBankAccountIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const token = getTokenRequired(context);
    const tenantId = getTenantIdRequired(context);

    return await getXeroAllowedValues({
      token,
      tenantId,
      path: 'Accounts',
      dataPath: 'Accounts',
      params: { where: 'Type=="BANK"' },
      mapItemToAllowedValue: mapXeroBankAccountToAllowedValue,
    });
  } catch (error) {
    throw new XeroError(`Couldn't fetch Xero bank account IDs: ${error}`);
  }
};
