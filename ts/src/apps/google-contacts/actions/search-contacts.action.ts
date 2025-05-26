import { people_v1 } from '@googleapis/people';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_CONTACTS_APP_NAME, GoogleContactsError } from '../constants';
import { createGooglePeopleClient } from '../helpers/constants';

const options = {
  search_field: {
    type: 'string',
    required: false,
    preselected: true,
    allowed_values: [
      {
        value: 'email',
        display_name: 'Email Address',
      },
      {
        value: 'full_name',
        display_name: 'Full Name',
      },
      {
        value: 'phone_number',
        display_name: 'Phone Number',
      },
    ],
  },
  search_type: {
    type: 'string',
    required: false,
    preselected: true,
    default_value: 'contains',
    allowed_values: [
      {
        value: 'contains',
        display_name: 'Contains',
      },
      {
        value: 'exact',
        display_name: 'Exact Match',
      },
    ],
  },
  search_value: {
    type: 'string',
    required: false,
    preselected: true,
  },
} satisfies TQoreOptions;

const searchGoogleContacts = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_CONTACTS_APP_NAME,
  action: 'search_contacts',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: GoogleContactsError,
    });

    const search_field = obj?.search_field;
    const search_type = obj?.search_type || 'contains';
    const search_value = obj?.search_value?.trim();

    try {
      const client = createGooglePeopleClient(token);

      const allContacts: people_v1.Schema$Person[] = [];
      let pageToken: string | undefined | null;

      do {
        const response = await client.people.connections.list({
          resourceName: 'people/me',
          personFields: 'names,emailAddresses,phoneNumbers,metadata',
          pageSize: 1000,
          ...(pageToken && { pageToken }),
        });

        if (response.data.connections) {
          allContacts.push(...response.data.connections);
        }

        pageToken = response.data.nextPageToken;
      } while (pageToken);

      let filteredContacts: people_v1.Schema$Person[] = [];

      if (search_value) {
        filteredContacts = allContacts.filter((contact) => {
          const searchValueLower = search_value.toLowerCase();

          switch (search_field) {
            case 'email':
              if (!contact.emailAddresses) return false;

              return contact.emailAddresses.some((email) => {
                const emailValue = email.value?.toLowerCase() || '';

                return search_type === 'exact'
                  ? emailValue === searchValueLower
                  : emailValue.includes(searchValueLower);
              });

            case 'full_name':
              if (!contact.names) return false;

              return contact.names.some((name) => {
                const displayName = name.displayName?.toLowerCase() || '';
                const givenName = name.givenName?.toLowerCase() || '';
                const familyName = name.familyName?.toLowerCase() || '';
                const fullName = `${givenName} ${familyName}`.trim().toLowerCase();

                if (search_type === 'exact') {
                  return (
                    displayName === searchValueLower ||
                    fullName === searchValueLower ||
                    givenName === searchValueLower ||
                    familyName === searchValueLower
                  );
                } else {
                  return (
                    displayName.includes(searchValueLower) ||
                    fullName.includes(searchValueLower) ||
                    givenName.includes(searchValueLower) ||
                    familyName.includes(searchValueLower)
                  );
                }
              });

            case 'phone_number':
              if (!contact.phoneNumbers) return false;

              return contact.phoneNumbers.some((phone) => {
                const phoneValue = phone.value?.toLowerCase().replace(/\D/g, '') || '';
                const searchPhone = searchValueLower.replace(/\D/g, '');

                return search_type === 'exact'
                  ? phoneValue === searchPhone
                  : phoneValue.includes(searchPhone);
              });

            default:
              return false;
          }
        });
      } else {
        filteredContacts = allContacts;
      }

      const transformedContacts = filteredContacts.map((contact) => ({
        resourceName: contact.resourceName,
        etag: contact.etag,
        names:
          contact.names?.map((name) => ({
            displayName: name.displayName,
            givenName: name.givenName,
            familyName: name.familyName,
            honorificPrefix: name.honorificPrefix,
            honorificSuffix: name.honorificSuffix,
            middleName: name.middleName,
          })) || [],
        emailAddresses:
          contact.emailAddresses?.map((email) => ({
            value: email.value,
            type: email.type,
            formattedType: email.formattedType,
          })) || [],
        phoneNumbers:
          contact.phoneNumbers?.map((phone) => ({
            value: phone.value,
            type: phone.type,
            formattedType: phone.formattedType,
          })) || [],
        metadata: {
          source: contact.metadata?.sources?.[0],
          objectType: contact.metadata?.objectType,
        },
      }));

      return transformedContacts;
    } catch (error) {
      throw new GoogleContactsError(`Failed to search Google contacts: ${error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        resourceName: { type: 'string' },
        etag: { type: 'string' },
        names: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                displayName: { type: 'string' },
                givenName: { type: 'string' },
                familyName: { type: 'string' },
                honorificPrefix: { type: 'string' },
                honorificSuffix: { type: 'string' },
                middleName: { type: 'string' },
              },
            },
          },
        },
        emailAddresses: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                value: { type: 'string' },
                type: { type: 'string' },
                formattedType: { type: 'string' },
              },
            },
          },
        },
        phoneNumbers: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                value: { type: 'string' },
                type: { type: 'string' },
                formattedType: { type: 'string' },
              },
            },
          },
        },
        metadata: {
          type: {
            type: 'hash',
            fields: {
              source: { type: 'hash' },
              objectType: { type: 'string' },
            },
          },
        },
      },
    },
  } satisfies TQoreResponseType,
});

export default searchGoogleContacts;
