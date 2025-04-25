import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { XeroError } from '../constants';
import { getTenantIdRequired, getTokenRequired, getXeroAllowedValues } from './constants';

type XeroTaxType = {
  TaxType: string;
  Name: string;
  TaxRate: number;
  Status: string;
  CanApplyToAssets: boolean;
  CanApplyToEquity: boolean;
  CanApplyToExpenses: boolean;
  CanApplyToLiabilities: boolean;
  CanApplyToRevenue: boolean;
  DisplayTaxRate: number;
  EffectiveRate: number;
};

const mapXeroTaxTypeToAllowedValue = (taxType: XeroTaxType): IQoreAllowedValue<string> => ({
  display_name: taxType.Name,
  value: taxType.TaxType,
  desc:
    `Rate: ${taxType.TaxRate}%\n\n` +
    `Status: ${taxType.Status}\n\n` +
    `Effective Rate: ${taxType.EffectiveRate}%\n\n` +
    `Can Apply To:\n\n` +
    `Assets: ${taxType.CanApplyToAssets ? 'Yes' : 'No'}\n\n` +
    `Equity: ${taxType.CanApplyToEquity ? 'Yes' : 'No'}\n\n` +
    `Expenses: ${taxType.CanApplyToExpenses ? 'Yes' : 'No'}\n\n` +
    `Liabilities: ${taxType.CanApplyToLiabilities ? 'Yes' : 'No'}\n\n` +
    `Revenue: ${taxType.CanApplyToRevenue ? 'Yes' : 'No'}`,
});

export const getXeroTaxTypeAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const token = getTokenRequired(context);
    const tenantId = getTenantIdRequired(context);

    return await getXeroAllowedValues({
      token,
      tenantId,
      path: 'TaxRates',
      dataPath: 'TaxRates',
      mapItemToAllowedValue: mapXeroTaxTypeToAllowedValue,
    });
  } catch (error) {
    throw new XeroError(`Couldn't fetch Xero tax types: ${error}`);
  }
};
