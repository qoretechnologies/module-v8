import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { XeroError } from '../constants';
import { getTenantIdRequired, getTokenRequired, getXeroAllowedValues } from './constants';

type XeroItem = {
  ItemID: string;
  Code: string;
  Name: string;
  Description?: string;
  PurchaseDescription?: string;
  SalesDetails?: {
    UnitPrice: number;
    AccountCode: string;
    TaxType: string;
  };
  PurchaseDetails?: {
    UnitPrice: number;
    AccountCode: string;
    TaxType: string;
  };
  IsTrackedAsInventory?: boolean;
  IsSold?: boolean;
  IsPurchased?: boolean;
};

const mapXeroItemToAllowedValue = (item: XeroItem): IQoreAllowedValue<string> => ({
  display_name: `${item.Code}` + (item.Name ? ` - (${item.Name})` : ''),
  value: item.Code,
  desc:
    `Description: ${item.Description || 'N/A'}\n\n` +
    `Purchase Description: ${item.PurchaseDescription || 'N/A'}\n\n` +
    `Sales Price: ${item.SalesDetails?.UnitPrice || 'N/A'}\n\n` +
    `Purchase Price: ${item.PurchaseDetails?.UnitPrice || 'N/A'}\n\n` +
    `Inventory Tracked: ${item.IsTrackedAsInventory ? 'Yes' : 'No'}\n\n` +
    `For Sale: ${item.IsSold ? 'Yes' : 'No'}\n\n` +
    `For Purchase: ${item.IsPurchased ? 'Yes' : 'No'}`,
});

export const getXeroItemCodeAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const token = getTokenRequired(context);
    const tenantId = getTenantIdRequired(context);

    return await getXeroAllowedValues({
      token,
      tenantId,
      path: 'Items',
      dataPath: 'Items',
      mapItemToAllowedValue: mapXeroItemToAllowedValue,
    });
  } catch (error) {
    throw new XeroError(`Couldn't fetch Xero item codes: ${error}`);
  }
};
