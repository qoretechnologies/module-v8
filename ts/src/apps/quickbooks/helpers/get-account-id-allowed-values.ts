import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Account } from 'quickbooks-node-promise/dist/qbTypes';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QuickbooksError } from '../constants';
import {
  createQuickbooksClient,
  QUICKBOOKS_ALLOWED_VALUES_LIMIT,
  QUICKBOOKS_ALLOWED_VALUES_TIMEOUT,
} from './constants';

const mapQuickbooksItemToAllowedValue = (item: Account): IQoreAllowedValue<string> => ({
  value: item.Id!,
  display_name: item.Name,
});

export const getQuickbooksAccountIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, instance_type, realm_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_type', 'realm_id'],
    ErrorClass: QuickbooksError,
  });

  const client = createQuickbooksClient({ token, instance_type, realm_id });

  const allAccounts: Account[] = [];
  let total = 0;
  const start = Date.now();

  try {
    const accounts = await client.findAccounts({
      desc: 'MetaData.CreateTime',
    });

    allAccounts.push(...(accounts.QueryResponse.Account || []));
    total = accounts.QueryResponse.maxResults || 0;

    while (
      allAccounts.length <= QUICKBOOKS_ALLOWED_VALUES_LIMIT &&
      allAccounts.length <= total &&
      Date.now() - start < QUICKBOOKS_ALLOWED_VALUES_TIMEOUT
    ) {
      const accounts = await client.findAccounts({
        desc: 'MetaData.CreateTime',
        offset: allAccounts.length,
      });

      allAccounts.push(...(accounts.QueryResponse.Account || []));
      total = accounts.QueryResponse.maxResults || 0;
    }
  } catch (error) {
    console.error(`Failed to fetch addresses: ${error}`);
  }

  return allAccounts.map(mapQuickbooksItemToAllowedValue);
};
