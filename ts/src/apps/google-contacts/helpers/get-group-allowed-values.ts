import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { GoogleContactsError } from '../constants';
import { createGooglePeopleClient } from './constants';

export const getGoogleContactsGroupAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new GoogleContactsError('Token is required to get Google Contacts group allowed values');
  }

  try {
    const client = createGooglePeopleClient(token);

    const response = await client.contactGroups.list({
      pageSize: 1000,
    });

    const allowedValues: IQoreAllowedValue<string>[] = [];

    if (response.data.contactGroups) {
      response.data.contactGroups.forEach((group) => {
        if (group.resourceName && group.name) {
          allowedValues.push({
            display_name: group.formattedName || group.name,
            value: group.resourceName,
            desc:
              `Resource Name: ${group.resourceName}\n` +
              `Name: ${group.name}\n` +
              `Group Type: ${group.groupType || 'USER_CONTACT_GROUP'}\n` +
              `Member Count: ${group.memberCount || 0}\n` +
              `Formatted Name: ${group.formattedName || group.name}`,
          });
        }
      });
    }

    return allowedValues;
  } catch (error) {
    throw new GoogleContactsError(`Failed to get Google Contacts groups: ${error}`);
  }
};
