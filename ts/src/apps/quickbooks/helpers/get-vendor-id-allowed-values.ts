// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Vendor } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import { createQuickbooksClient, fetchQuickbooksRecords } from './constants';

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

  const allVendors = await fetchQuickbooksRecords<Vendor>(
    (query) => client.findVendors(query),
    'Vendor'
  );

  return allVendors.map(mapQuickbooksVendorToAllowedValue);
};
