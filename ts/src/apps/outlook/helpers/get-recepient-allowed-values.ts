import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { Contact } from '@microsoft/microsoft-graph-types';
import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

export const getOutlookRecipientsAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  any
> = async (context): Promise<IQoreAllowedValue<any>[]> => {
  const token = context?.conn_opts?.token;

  const missingValues: string[] = [];

  if (!token) missingValues.push('token');

  if (missingValues.length) {
    throw new Error(
      `All of the following ${missingValues.join(', ')} are required to get Outlook recipients allowed values`
    );
  }

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token!),
    },
  });

  const allowedValues: IQoreAllowedValue<any>[] = [];

  try {
    let response: PageCollection = await client
      .api('/me/contacts')
      .select('id,displayName,givenName,surname,emailAddresses')
      .top(100)
      .orderby('displayName')
      .get();

    while (response.value.length > 0) {
      for (const contact of response.value as Contact[]) {
        if (contact.emailAddresses && contact.emailAddresses.length > 0) {
          const fullName =
            `${contact.givenName || ''} ${contact.surname || ''}`.trim() || 'Unnamed Contact';

          contact.emailAddresses.forEach((email) => {
            if (email.address) {
              allowedValues.push({
                display_name: `${fullName} (${email.address})`,
                value: {
                  emailAddress: {
                    address: email.address,
                    name: email.name || fullName,
                  },
                },
                short_desc: `Email: ${email.address}\nName: ${fullName}`,
              });
            }
          });
        }
      }

      if (response['@odata.nextLink']) {
        response = await client.api(response['@odata.nextLink']).get();
      } else {
        break;
      }
    }

    return allowedValues;
  } catch (error) {
    throw new Error(`Failed to fetch Outlook recipients: ${error.message}`);
  }
};
