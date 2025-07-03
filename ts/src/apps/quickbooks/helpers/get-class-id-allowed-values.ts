import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Class } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import {
  createQuickbooksClient,
  QUICKBOOKS_ALLOWED_VALUES_LIMIT,
  QUICKBOOKS_ALLOWED_VALUES_TIMEOUT,
} from './constants';

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

  const allClasses: Class[] = [];
  let total = 0;
  const start = Date.now();

  try {
    const classes = await client.findClasses({
      desc: 'MetaData.CreateTime',
    });

    allClasses.push(...(classes.QueryResponse.Class || []));
    total = classes.QueryResponse.maxResults || 0;

    while (
      allClasses.length <= QUICKBOOKS_ALLOWED_VALUES_LIMIT &&
      allClasses.length <= total &&
      Date.now() - start < QUICKBOOKS_ALLOWED_VALUES_TIMEOUT
    ) {
      const classes = await client.findClasses({
        desc: 'MetaData.CreateTime',
        offset: allClasses.length,
      });

      allClasses.push(...(classes.QueryResponse.Class || []));
      total = classes.QueryResponse.maxResults || 0;
    }
  } catch (error) {
    console.error(`Failed to fetch classes: ${error}`);
  }

  return allClasses.map(mapQuickbooksClassToAllowedValue);
};
