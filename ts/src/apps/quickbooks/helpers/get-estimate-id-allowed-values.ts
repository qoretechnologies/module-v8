import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Estimate } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import {
  createQuickbooksClient,
  QUICKBOOKS_ALLOWED_VALUES_LIMIT,
  QUICKBOOKS_ALLOWED_VALUES_TIMEOUT,
} from './constants';

const mapQuickbooksEstimateToAllowedValue = (estimate: Estimate): IQoreAllowedValue<string> => {
  const customerName = estimate.CustomerRef?.name || 'Unknown Customer';
  const totalAmount = estimate.TotalAmt || 0;
  const txnDate = estimate.TxnDate || 'No transaction date';
  const docNumber = estimate.DocNumber || 'No document number';
  const accepted = estimate.AcceptedBy ? 'Yes' : 'No';

  return {
    value: estimate.Id!,
    display_name: `${customerName} - $${totalAmount} (${docNumber})`,
    desc:
      `Customer: ${customerName}\n` +
      `Amount: ${totalAmount}\n` +
      `Date: ${txnDate}\n` +
      `Status: ${accepted === 'Yes' ? 'Accepted' : 'Pending'}`,
  };
};

export const getQuickbooksEstimateIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, realm_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'realm_id'],
    ErrorClass: QuickbooksError,
  });

  const client = createQuickbooksClient({ token, instance_type, realm_id });

  const allEstimates: Estimate[] = [];
  let total = 0;
  const start = Date.now();

  try {
    const estimates = await client.findEstimates({
      desc: 'MetaData.CreateTime',
    });

    allEstimates.push(...(estimates.QueryResponse.Estimate || []));
    total = estimates.QueryResponse.maxResults || 0;

    while (
      allEstimates.length <= QUICKBOOKS_ALLOWED_VALUES_LIMIT &&
      allEstimates.length <= total &&
      Date.now() - start < QUICKBOOKS_ALLOWED_VALUES_TIMEOUT
    ) {
      const estimates = await client.findEstimates({
        desc: 'MetaData.CreateTime',
        offset: allEstimates.length,
      });

      allEstimates.push(...(estimates.QueryResponse.Estimate || []));
      total = estimates.QueryResponse.maxResults || 0;
    }
  } catch (error) {
    console.error(`Failed to fetch estimates: ${error}`);
  }

  return allEstimates.map(mapQuickbooksEstimateToAllowedValue);
};
