import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ActiveDirectoryError } from '../constants';
import { createActiveDirectoryClient } from './constants';

type TActiveDirectoryItem = {
  id: string;
  displayName: string;
  description?: string;
};

export const getActiveDirectoryGroupAllowedValues: TQoreGetAllowedValuesFunction<
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
      .api('/groups')
      .select('*')
      .top(100)
      .headers({ ConsistencyLevel: 'eventual' })
      .orderby('createdDateTime desc')
      .count(true)
      .get();

    const allowedValues = response.value.map((group: TActiveDirectoryItem) => ({
      value: group.id,
      display_name: group.displayName,
      ...(group.description && { description: group.description }),
    }));

    return allowedValues;
  } catch (error) {
    throw new ActiveDirectoryError(`Failed to fetch groups: ${error.message || error}`);
  }
};
