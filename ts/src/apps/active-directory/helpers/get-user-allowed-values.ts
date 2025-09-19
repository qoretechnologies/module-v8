import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ActiveDirectoryError } from '../constants';
import { createActiveDirectoryClient } from './constants';

type TActiveDirectoryItem = {
  id: string;
  displayName: string;
  userPrincipalName: string;
  mail: string;
};

export const getActiveDirectoryUserAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: ActiveDirectoryError,
  });

  try {
    const client = createActiveDirectoryClient(token);

    const response: { value: TActiveDirectoryItem[] } = await client
      .api('/users')
      .select('*')
      .top(100)
      .orderby('createdDateTime desc')
      .headers({ ConsistencyLevel: 'eventual' })
      .count(true)
      .get();

    const allowedValues = response.value.map(
      (user: TActiveDirectoryItem): IQoreAllowedValue<string> => {
        const userMail = user.mail || user.userPrincipalName || '';

        return {
          value: user.id,
          display_name: `${user.displayName} (${userMail})`,
        };
      }
    );

    return allowedValues;
  } catch (error) {
    throw new ActiveDirectoryError(`Failed to fetch users: ${error.message || error}`);
  }
};
