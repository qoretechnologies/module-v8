import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Purchase } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import {
  createQuickbooksClient,
  QUICKBOOKS_ALLOWED_VALUES_LIMIT,
  QUICKBOOKS_ALLOWED_VALUES_TIMEOUT,
} from './constants';

const mapQuickbooksPurchaseToAllowedValue = (purchase: Purchase): IQoreAllowedValue<string> => {
  const entityName = purchase.EntityRef?.name || 'Unknown Entity';
  const totalAmount = purchase.TotalAmt || 0;
  const txnDate = purchase.TxnDate || 'No transaction date';
  const paymentType = purchase.PaymentType || 'Unknown Payment';
  const docNumber = purchase.DocNumber || '';

  const displaySuffix = docNumber ? ` (${docNumber})` : ` (${txnDate})`;

  return {
    value: purchase.Id!,
    display_name: `${entityName} - $${totalAmount}${displaySuffix}`,
    desc:
      `Entity: ${entityName}\n` +
      `Amount: $${totalAmount}\n` +
      `Date: ${txnDate}\n` +
      `Payment: ${paymentType}`,
  };
};

export const getQuickbooksPurchaseIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, realm_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'realm_id'],
    ErrorClass: QuickbooksError,
  });

  const client = createQuickbooksClient({ token, instance_type, realm_id });

  const allPurchases: Purchase[] = [];
  let total = 0;
  const start = Date.now();

  try {
    const purchases = await client.findPurchases({
      desc: 'MetaData.CreateTime',
    });

    allPurchases.push(...(purchases.QueryResponse.Purchase || []));
    total = purchases.QueryResponse.maxResults || 0;

    while (
      allPurchases.length <= QUICKBOOKS_ALLOWED_VALUES_LIMIT &&
      allPurchases.length <= total &&
      Date.now() - start < QUICKBOOKS_ALLOWED_VALUES_TIMEOUT
    ) {
      const purchases = await client.findPurchases({
        desc: 'MetaData.CreateTime',
        offset: allPurchases.length,
      });

      allPurchases.push(...(purchases.QueryResponse.Purchase || []));
      total = purchases.QueryResponse.maxResults || 0;
    }
  } catch (error) {
    console.error(`Failed to fetch purchases: ${error}`);
  }

  return allPurchases.map(mapQuickbooksPurchaseToAllowedValue);
};
