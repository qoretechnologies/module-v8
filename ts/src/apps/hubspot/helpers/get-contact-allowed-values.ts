import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchHubspotAllowedValues } from './constants';

type THubspotContact = {
  id: string;
  properties: {
    createdate: string;
    email: string;
    firstname: string;
    hs_object_id: string;
    lastmodifieddate: string;
    lastname: string;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
};

const mapHubspotContact = (contact: THubspotContact): IQoreAllowedValue<string> => ({
  value: contact.id,
  display_name: contact.properties.firstname + ' ' + contact.properties.lastname,
  short_desc:
    `Email: ${contact.properties.email}\n\nArchived: ${contact.archived}\n\n` +
    `Created at: ${contact.createdAt}\n\nUpdated at: ${contact.updatedAt}`,
});

export const getHubspotContactAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Hubspot contact allowed values');
  }

  const contacts = await fetchHubspotAllowedValues<THubspotContact>({
    token,
    object: 'contacts',
    mapItemToAllowedValue: mapHubspotContact,
  });

  return contacts;
};
