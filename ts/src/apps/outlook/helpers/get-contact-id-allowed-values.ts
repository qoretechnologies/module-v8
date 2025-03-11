import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { Contact } from '@microsoft/microsoft-graph-types';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

export const getOutlookContactIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  const missingValues: string[] = [];

  if (!token) missingValues.push('token');

  if (missingValues.length) {
    throw new Error(
      `All of the following ${missingValues.join(', ')} are required to get Outlook contact ID allowed values`
    );
  }

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token!),
    },
  });

  const allowedValues: IQoreAllowedValue<string>[] = [];

  try {
    let response: PageCollection = await client
      .api('/me/contacts')
      .select('id,displayName,givenName,surname,emailAddresses,companyName,jobTitle')
      .top(50)
      .orderby('displayName')
      .get();

    while (response.value.length > 0) {
      for (const contact of response.value as Contact[]) {
        const fullName =
          `${contact.givenName || ''} ${contact.surname || ''}`.trim() || 'Unnamed Contact';
        const email =
          contact.emailAddresses && contact.emailAddresses.length > 0
            ? contact.emailAddresses[0].address
            : 'No email';

        allowedValues.push({
          display_name: fullName,
          value: contact.id!,
          short_desc:
            `Email: ${email}\n\n` +
            `Company: ${contact.companyName || 'Not specified'}\n\n` +
            `Job Title: ${contact.jobTitle || 'Not specified'}`,
        });
      }

      if (response['@odata.nextLink']) {
        response = await client.api(response['@odata.nextLink']).get();
      } else {
        break;
      }
    }

    return allowedValues;
  } catch (error) {
    throw new Error(`Failed to fetch Outlook contacts: ${error.message}`);
  }
};
