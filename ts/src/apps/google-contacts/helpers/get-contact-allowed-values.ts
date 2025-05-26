import { people_v1 } from '@googleapis/people';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { GoogleContactsError } from '../constants';
import { createGooglePeopleClient } from './constants';

export const getGoogleContactsContactAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new GoogleContactsError(
      'Token is required to get Google Contacts contact allowed values'
    );
  }

  try {
    const client = createGooglePeopleClient(token);

    const allContacts: people_v1.Schema$Person[] = [];

    const response = await client.people.connections.list({
      resourceName: 'people/me',
      personFields: 'names,emailAddresses,phoneNumbers,photos',
      pageSize: 1000,
    });

    if (response.data.connections) {
      allContacts.push(...response.data.connections);
    }

    const allowedValues: IQoreAllowedValue<string>[] = [];

    allContacts.forEach((contact) => {
      if (contact.resourceName) {
        const primaryName = contact.names?.[0];
        const displayName =
          primaryName?.displayName ||
          `${primaryName?.givenName || ''} ${primaryName?.familyName || ''}`.trim() ||
          'Unnamed Contact';

        const primaryEmail = contact.emailAddresses?.[0]?.value || 'No email';

        const primaryPhone = contact.phoneNumbers?.[0]?.value || 'No phone';

        const photoUrl = contact.photos?.[0]?.url;

        allowedValues.push({
          display_name: displayName,
          value: contact.resourceName,
          ...(photoUrl && { image: photoUrl }),
          desc:
            `Resource Name: ${contact.resourceName}\n` +
            `Name: ${displayName}\n` +
            `Email: ${primaryEmail}\n` +
            `Phone: ${primaryPhone}\n` +
            `Total Names: ${contact.names?.length || 0}\n` +
            `Total Emails: ${contact.emailAddresses?.length || 0}\n` +
            `Total Phones: ${contact.phoneNumbers?.length || 0}`,
        });
      }
    });

    return allowedValues;
  } catch (error) {
    throw new GoogleContactsError(`Failed to get Google Contacts contacts: ${error}`);
  }
};
