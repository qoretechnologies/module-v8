import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Bill } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import {
  createQuickbooksClient,
  QUICKBOOKS_ALLOWED_VALUES_LIMIT,
  QUICKBOOKS_ALLOWED_VALUES_TIMEOUT,
} from './constants';

const mapQuickbooksBillToAllowedValue = (bill: Bill): IQoreAllowedValue<string> => {
  const vendorName = bill.VendorRef?.name || 'Unknown Vendor';
  const totalAmount = bill.TotalAmt || 0;
  const dueDate = bill.DueDate || 'No due date';
  const billNumber = bill.DocNumber || 'No bill number';

  return {
    value: bill.Id!,
    display_name: `${vendorName} - $${totalAmount} (${billNumber})`,
    desc: `Vendor: ${vendorName}\nAmount: $${totalAmount}\nDue Date: ${dueDate}\nBill Number: ${billNumber}`,
  };
};

export const getQuickbooksBillIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, realm_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'realm_id'],
    ErrorClass: QuickbooksError,
  });

  const client = createQuickbooksClient({ token, instance_type, realm_id });

  const allBills: Bill[] = [];
  let total = 0;
  const start = Date.now();

  try {
    const bills = await client.findBills({
      desc: 'MetaData.CreateTime',
    });

    allBills.push(...(bills.QueryResponse.Bill || []));
    total = bills.QueryResponse.maxResults || 0;

    while (
      allBills.length <= QUICKBOOKS_ALLOWED_VALUES_LIMIT &&
      allBills.length <= total &&
      Date.now() - start < QUICKBOOKS_ALLOWED_VALUES_TIMEOUT
    ) {
      const bills = await client.findBills({
        desc: 'MetaData.CreateTime',
        offset: allBills.length,
      });

      allBills.push(...(bills.QueryResponse.Bill || []));
      total = bills.QueryResponse.maxResults || 0;
    }
  } catch (error) {
    console.error(`Failed to fetch bills: ${error}`);
  }

  return allBills.map(mapQuickbooksBillToAllowedValue);
};
