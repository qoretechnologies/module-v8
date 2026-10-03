// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Class } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import { createQuickbooksClient, fetchQuickbooksRecords } from './constants';

const mapQuickbooksClassToAllowedValue = (qbClass: Class): IQoreAllowedValue<string> => {
  const className = qbClass.Name || 'Unknown Class';
  const parentClassName = qbClass.ParentRef?.name || '';
  const isActive = qbClass.Active !== false;
  const isSubClass = !!qbClass.ParentRef;

  const displayName = isSubClass && parentClassName ? `${parentClassName}:${className}` : className;

  const statusIndicator = isActive ? '' : ' [INACTIVE]';
  const classType = isSubClass ? 'Sub-class' : 'Main class';

  return {
    value: qbClass.Id!,
    display_name: `${displayName}${statusIndicator}`,
    desc:
      `Name: ${className}\n` +
      `Type: ${classType}\n` +
      `Parent: ${parentClassName || 'None'}\n` +
      `Status: ${isActive ? 'Active' : 'Inactive'}`,
  };
};

export const getQuickbooksClassIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, realm_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'realm_id'],
    ErrorClass: QuickbooksError,
  });

  const client = createQuickbooksClient({ token, instance_type, realm_id });

  const allClasses = await fetchQuickbooksRecords<Class>(
    (query) => client.findClasses(query),
    'Class'
  );

  return allClasses.map(mapQuickbooksClassToAllowedValue);
};
