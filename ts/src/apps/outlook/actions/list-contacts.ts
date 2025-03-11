import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { Contact } from '@microsoft/microsoft-graph-types';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { OUTLOOK_APP_NAME } from '../constants';

const options = {
  limit: {
    type: 'number',
    required: false,
    default_value: 50,
    preselected: true,
  },
  filter: {
    type: 'string',
    required: false,
    preselected: true,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'list',
  element_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      displayName: { type: 'string' },
      givenName: { type: 'string' },
      surname: { type: 'string' },
      emailAddresses: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              address: { type: 'string' },
              name: { type: 'string' },
            },
          },
        },
      },
      businessPhones: {
        type: {
          type: 'list',
          element_type: { type: 'string' },
        },
      },
      mobilePhone: { type: 'string' },
      companyName: { type: 'string' },
      jobTitle: { type: 'string' },
      department: { type: 'string' },
      officeLocation: { type: 'string' },
      businessAddress: {
        type: {
          type: 'hash',
          fields: {
            street: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            countryOrRegion: { type: 'string' },
            postalCode: { type: 'string' },
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;

export const ListOutlookContacts = QoreAppCreator.createLocalizedAction<typeof options>({
  action: 'list-contacts',
  app: OUTLOOK_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const limit = data?.limit || 50;
    const filter = data?.filter;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to get Outlook contacts`
      );
    }

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: () => Promise.resolve(token!),
      },
    });

    const result: Contact[] = [];

    try {
      let request = client
        .api('/me/contacts')
        .select(
          [
            'id',
            'displayName',
            'givenName',
            'surname',
            'emailAddresses',
            'businessPhones',
            'mobilePhone',
            'companyName',
            'jobTitle',
            'department',
            'officeLocation',
            'businessAddress',
          ].join(',')
        )
        .top(Math.min(limit, 100));

      if (filter) {
        request = request.filter(
          `contains(displayName,'${filter}') or contains(givenName,'${filter}') or contains(surname,'${filter}')`
        );
      }

      let response: PageCollection = await request.get();

      while (response.value.length > 0 && result.length < limit) {
        result.push(...(response.value as Contact[]));

        if (result.length < limit && response['@odata.nextLink']) {
          response = await client.api(response['@odata.nextLink']).get();
        } else {
          break;
        }
      }

      return result.slice(0, limit);
    } catch (error) {
      throw new Error(`Failed to fetch Outlook contacts: ${error.message}`);
    }
  },
  options,
  response_type,
});
