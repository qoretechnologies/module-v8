import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { TaxCode } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import {
  createQuickbooksClient,
  QUICKBOOKS_ALLOWED_VALUES_LIMIT,
  QUICKBOOKS_ALLOWED_VALUES_TIMEOUT,
} from './constants';

const mapQuickbooksTaxCodeToAllowedValue = (taxCode: TaxCode): IQoreAllowedValue<string> => {
  const taxCodeName = taxCode.Name || 'Unknown Tax Code';
  const taxable = taxCode.Taxable !== false;
  const isActive = taxCode.Active !== false;

  const taxRate = taxCode.SalesTaxRateList?.TaxRateDetail?.[0]?.TaxRateRef?.name || '';
  const rateDisplay = taxRate ? taxRate : 'No rate';

  const statusIndicator = isActive ? '' : ' [INACTIVE]';
  const taxableIndicator = taxable ? 'Taxable' : 'Non-taxable';

  return {
    value: taxCode.Id!,
    display_name: `${taxCodeName}${statusIndicator}`,
    desc:
      `Name: ${taxCodeName}\n` +
      `Type: ${taxableIndicator}\n` +
      `Rate: ${rateDisplay}\n` +
      `Status: ${isActive ? 'Active' : 'Inactive'}`,
  };
};

export const getQuickbooksTaxCodeIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, realm_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'realm_id'],
    ErrorClass: QuickbooksError,
  });

  const client = createQuickbooksClient({ token, instance_type, realm_id });

  const allTaxCodes: TaxCode[] = [];
  let total = 0;
  const start = Date.now();

  try {
    const taxCodes = await client.findTaxCodes({
      desc: 'MetaData.CreateTime',
    });

    allTaxCodes.push(...(taxCodes.QueryResponse.TaxCode || []));
    total = taxCodes.QueryResponse.maxResults || 0;

    while (
      allTaxCodes.length <= QUICKBOOKS_ALLOWED_VALUES_LIMIT &&
      allTaxCodes.length <= total &&
      Date.now() - start < QUICKBOOKS_ALLOWED_VALUES_TIMEOUT
    ) {
      const taxCodes = await client.findTaxCodes({
        desc: 'MetaData.CreateTime',
        offset: allTaxCodes.length,
      });

      allTaxCodes.push(...(taxCodes.QueryResponse.TaxCode || []));
      total = taxCodes.QueryResponse.maxResults || 0;
    }
  } catch (error) {
    console.error(`Failed to fetch tax codes: ${error}`);
  }

  return allTaxCodes.map(mapQuickbooksTaxCodeToAllowedValue);
};
