import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ActiveDirectoryError } from '../constants';
import { createActiveDirectoryClient } from './constants';

type TActiveDirectoryItem = {
  id: string;
  displayName: string;
  userPrincipalName: string;
  mail: string;
};

export const getActiveDirectoryGroupUserAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, group_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['group_id'],
    ErrorClass: ActiveDirectoryError,
  });

  try {
    const client = createActiveDirectoryClient(token);

    const response: { value: TActiveDirectoryItem[] } = await client
      .api(`/groups/${group_id}/members/microsoft.graph.user`)
      .select('*')
      .top(100)
      .count(true)
      .headers({ ConsistencyLevel: 'eventual' })
      .orderby('createdDateTime desc')
      .get();

    const allowedValues = response.value.map((user: TActiveDirectoryItem) => {
      const userMail = user.mail || user.userPrincipalName || '';

      return {
        value: user.id,
        display_name: `${user.displayName} (${userMail})`,
      };
    });

    return allowedValues;
  } catch (error) {
    throw new ActiveDirectoryError(`Failed to fetch users: ${error.message || error}`);
  }
};
