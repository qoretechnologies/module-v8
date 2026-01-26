import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Vendor } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import {
  createQuickbooksClient,
  QUICKBOOKS_ALLOWED_VALUES_LIMIT,
  QUICKBOOKS_ALLOWED_VALUES_TIMEOUT,
} from './constants';

const mapQuickbooksVendorToAllowedValue = (vendor: Vendor): IQoreAllowedValue<string> => {
  const vendorName = vendor.DisplayName || 'Unknown Vendor';
  const companyName = vendor.CompanyName || '';
  const email = vendor.PrimaryEmailAddr?.Address || 'No email';
  const balance = vendor.Balance || 0;
  const isActive = vendor.Active !== false;

  const displayName =
    companyName && companyName !== vendorName ? `${vendorName} (${companyName})` : vendorName;

  const statusIndicator = isActive ? '' : ' [INACTIVE]';

  return {
    value: vendor.Id!,
    display_name: `${displayName}${statusIndicator}`,
    desc:
      `Name: ${vendorName}\n` +
      `Email: ${email}\n` +
      `Balance: $${balance}\n` +
      `Status: ${isActive ? 'Active' : 'Inactive'}`,
  };
};

export const getQuickbooksVendorIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, realm_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'realm_id'],
    ErrorClass: QuickbooksError,
  });

  const client = createQuickbooksClient({ token, instance_type, realm_id });

  const allVendors: Vendor[] = [];
  let total = 0;
  const start = Date.now();

  try {
    const vendors = await client.findVendors({
      desc: 'MetaData.CreateTime',
    });

    allVendors.push(...(vendors.QueryResponse.Vendor || []));
    total = vendors.QueryResponse.maxResults || 0;

    while (
      allVendors.length <= QUICKBOOKS_ALLOWED_VALUES_LIMIT &&
      allVendors.length <= total &&
      Date.now() - start < QUICKBOOKS_ALLOWED_VALUES_TIMEOUT
    ) {
      const vendors = await client.findVendors({
        desc: 'MetaData.CreateTime',
        offset: allVendors.length,
      });

      allVendors.push(...(vendors.QueryResponse.Vendor || []));
      total = vendors.QueryResponse.maxResults || 0;
    }
  } catch (error) {
    console.error(`Failed to fetch vendors: ${error}`);
  }

  return allVendors.map(mapQuickbooksVendorToAllowedValue);
};
