import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { XeroError } from '../constants';
import { getTenantIdRequired, getTokenRequired, getXeroAllowedValues } from './constants';

type XeroAccount = {
  AccountID: string;
  Code: string;
  Name: string;
  Type: string;
  Status: string;
  Class?: string;
  TaxType?: string;
  Description?: string;
  CurrencyCode?: string;
};

const mapXeroAccountToAllowedValue = (account: XeroAccount): IQoreAllowedValue<string> => ({
  display_name: account.Name,
  value: account.AccountID,
  desc:
    `Type: ${account.Type}\n\n` +
    `Status: ${account.Status}\n\n` +
    `Class: ${account.Class || 'N/A'}\n\n` +
    `Tax Type: ${account.TaxType || 'N/A'}\n\n` +
    `Currency: ${account.CurrencyCode || 'Default'}\n\n` +
    `Description: ${account.Description || 'No description'}`,
});

export const getXeroAccountIdAllowedValues: TQoreGetAllowedValuesFunction<
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
      mapItemToAllowedValue: mapXeroAccountToAllowedValue,
    });
  } catch (error) {
    throw new XeroError(`Couldn't fetch Xero account IDs: ${error}`);
  }
};
