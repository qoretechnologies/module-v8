// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { PurchaseOrder } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import { createQuickbooksClient, fetchQuickbooksRecords } from './constants';

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

  const allPurchaseOrders = await fetchQuickbooksRecords<PurchaseOrder>(
    (query) => client.findPurchaseOrders(query),
    'PurchaseOrder'
  );

  return allPurchaseOrders.map(mapQuickbooksPurchaseOrderToAllowedValue);
};
