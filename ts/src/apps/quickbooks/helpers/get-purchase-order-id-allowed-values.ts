import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { PurchaseOrder } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import {
  createQuickbooksClient,
  QUICKBOOKS_ALLOWED_VALUES_LIMIT,
  QUICKBOOKS_ALLOWED_VALUES_TIMEOUT,
} from './constants';

const mapQuickbooksPurchaseOrderToAllowedValue = (
  purchaseOrder: PurchaseOrder
): IQoreAllowedValue<string> => {
  const vendorName = purchaseOrder.VendorRef?.name || 'Unknown Vendor';
  const totalAmount = purchaseOrder.TotalAmt || 0;
  const txnDate = purchaseOrder.TxnDate || 'No transaction date';
  const docNumber = purchaseOrder.DocNumber || 'No document number';
  const poStatus = purchaseOrder.POStatus || 'Unknown';

  return {
    value: purchaseOrder.Id!,
    display_name: `${vendorName} - $${totalAmount} (${docNumber})`,
    desc:
      `Vendor: ${vendorName}\n` +
      `Amount: $${totalAmount}\n` +
      `Date: ${txnDate}\n` +
      `Status: ${poStatus}`,
  };
};

export const getQuickbooksPurchaseOrderIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, realm_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'realm_id'],
    ErrorClass: QuickbooksError,
  });

  const client = createQuickbooksClient({ token, instance_type, realm_id });

  const allPurchaseOrders: PurchaseOrder[] = [];
  let total = 0;
  const start = Date.now();

  try {
    const purchaseOrders = await client.findPurchaseOrders({
      desc: 'MetaData.CreateTime',
    });

    allPurchaseOrders.push(...(purchaseOrders.QueryResponse.PurchaseOrder || []));
    total = purchaseOrders.QueryResponse.maxResults || 0;

    while (
      allPurchaseOrders.length <= QUICKBOOKS_ALLOWED_VALUES_LIMIT &&
      allPurchaseOrders.length <= total &&
      Date.now() - start < QUICKBOOKS_ALLOWED_VALUES_TIMEOUT
    ) {
      const purchaseOrders = await client.findPurchaseOrders({
        desc: 'MetaData.CreateTime',
        offset: allPurchaseOrders.length,
      });

      allPurchaseOrders.push(...(purchaseOrders.QueryResponse.PurchaseOrder || []));
      total = purchaseOrders.QueryResponse.maxResults || 0;
    }
  } catch (error) {
    console.error(`Failed to fetch purchase orders: ${error}`);
  }

  return allPurchaseOrders.map(mapQuickbooksPurchaseOrderToAllowedValue);
};
