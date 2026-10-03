// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Customer } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import { createQuickbooksClient, fetchQuickbooksRecords } from './constants';

const mapQuickbooksCustomerToAllowedValue = (customer: Customer): IQoreAllowedValue<string> => {
  const customerName = customer.DisplayName || 'Unknown Customer';
  const companyName = customer.CompanyName || '';
  const email = customer.PrimaryEmailAddr?.Address || 'No email';
  const phone = customer.PrimaryPhone?.FreeFormNumber || 'No phone';
  const balance = customer.Balance || 0;
  const isActive = customer.Active !== false;

  const displayName =
    companyName && companyName !== customerName ? `${customerName} (${companyName})` : customerName;

  const statusIndicator = isActive ? '' : ' [INACTIVE]';

  return {
    value: customer.Id!,
    display_name: `${displayName}${statusIndicator}`,
    desc:
      `Name: ${customerName}\n` +
      (companyName ? `Company: ${companyName}\n` : '') +
      `Email: ${email}\n` +
      `Phone: ${phone}\n` +
      `Balance: $${balance}\n` +
      `Status: ${isActive ? 'Active' : 'Inactive'}`,
  };
};

export const getQuickbooksCustomerIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, realm_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'realm_id'],
    ErrorClass: QuickbooksError,
  });

  const client = createQuickbooksClient({ token, instance_type, realm_id });

  const allCustomers = await fetchQuickbooksRecords<Customer>(
    (query) => client.findCustomers(query),
    'Customer'
  );

  return allCustomers.map(mapQuickbooksCustomerToAllowedValue);
};
