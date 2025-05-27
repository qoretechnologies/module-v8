import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreMappedOptions,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_CONTACTS_APP_NAME, GoogleContactsError } from '../constants';
import { createGooglePeopleClient } from '../helpers/constants';
import { getGoogleContactsContactAllowedValues } from '../helpers/get-contact-allowed-values';
import { people_v1 } from '@googleapis/people';

const options = {
  resource_name: {
    type: 'string',
    required: true,
    get_allowed_values: getGoogleContactsContactAllowedValues,
  },
} satisfies TQoreOptions;

const CONTACT_FIELDS = [
  'addresses',
  'biographies',
  'birthdays',
  'calendarUrls',
  'clientData',
  'coverPhotos',
  'emailAddresses',
  'events',
  'externalIds',
  'genders',
  'imClients',
  'interests',
  'locales',
  'locations',
  'memberships',
  'metadata',
  'miscKeywords',
  'names',
  'nicknames',
  'occupations',
  'organizations',
  'phoneNumbers',
  'photos',
  'relations',
  'sipAddresses',
  'skills',
  'urls',
  'userDefined',
];

const addIfNotEmpty = (contact: people_v1.Schema$Person, field: keyof people_v1.Schema$Person) => {
  const value = contact[field] as Record<string, any>[];
  if (value && value.length > 0) {
    return { [field]: value };
  }

  return {};
};

const getContact = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_CONTACTS_APP_NAME,
  action: 'get_contact',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, resource_name } = getQoreContextRequiredValues<
      TQoreMappedOptions<typeof options> & { token: string }
    >({
      context: { ...context, opts: obj },
      optionFields: ['resource_name'],
      connectionFields: ['token'],
      ErrorClass: GoogleContactsError,
    });

    try {
      const client = createGooglePeopleClient(token);

      const personFields = CONTACT_FIELDS.join(',');

      const response = await client.people.get({
        resourceName: resource_name,
        personFields: personFields,
      });

      const contact = response.data;

      const arrayFields = [
        'emailAddresses',
        'phoneNumbers',
        'organizations',
        'addresses',
        'birthdays',
        'urls',
        'relations',
        'biographies',
        'photos',
        'userDefined',
        'events',
        'nicknames',
        'memberships',
        'interests',
        'skills',
        'imClients',
        'externalIds',
        'clientData',
      ] satisfies (keyof people_v1.Schema$Person)[];

      const processedContact: Record<string, any> = {
        resourceName: contact.resourceName,
        etag: contact.etag,
        ...(contact.metadata && { metadata: contact.metadata }),
      };

      arrayFields.forEach((field) => {
        Object.assign(processedContact, addIfNotEmpty(contact, field));
      });

      if (contact.names && contact.names.length > 0) {
        const primaryName = contact.names[0];

        processedContact.names = contact.names;

        processedContact.displayName =
          primaryName.displayName ||
          `${primaryName.givenName || ''} ${primaryName.familyName || ''}`.trim() ||
          'Unnamed Contact';
      }

      return {
        success: true,
        contact: processedContact,
      };
    } catch (error) {
      throw new GoogleContactsError(`Failed to get contact: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'boolean' },
      contact: {
        type: {
          type: 'hash',
          fields: {
            resourceName: { type: 'string' },
            etag: { type: 'string' },
            displayName: { type: 'string' },
            names: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    displayName: { type: 'string' },
                    familyName: { type: 'string' },
                    givenName: { type: 'string' },
                    middleName: { type: 'string' },
                    honorificPrefix: { type: 'string' },
                    honorificSuffix: { type: 'string' },
                    phoneticFamilyName: { type: 'string' },
                    phoneticGivenName: { type: 'string' },
                    phoneticMiddleName: { type: 'string' },
                    phoneticHonorificPrefix: { type: 'string' },
                    phoneticHonorificSuffix: { type: 'string' },
                    unstructuredName: { type: 'string' },
                    metadata: { type: 'hash' },
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
                    metadata: { type: 'hash' },
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
                    canonicalForm: { type: 'string' },
                    type: { type: 'string' },
                    formattedType: { type: 'string' },
                    metadata: { type: 'hash' },
                  },
                },
              },
            },
            organizations: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    name: { type: 'string' },
                    title: { type: 'string' },
                    department: { type: 'string' },
                    symbol: { type: 'string' },
                    domain: { type: 'string' },
                    location: { type: 'string' },
                    jobDescription: { type: 'string' },
                    startDate: { type: 'hash' },
                    endDate: { type: 'hash' },
                    current: { type: 'boolean' },
                    type: { type: 'string' },
                    formattedType: { type: 'string' },
                    metadata: { type: 'hash' },
                  },
                },
              },
            },
            addresses: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    formattedValue: { type: 'string' },
                    type: { type: 'string' },
                    formattedType: { type: 'string' },
                    poBox: { type: 'string' },
                    streetAddress: { type: 'string' },
                    extendedAddress: { type: 'string' },
                    city: { type: 'string' },
                    region: { type: 'string' },
                    postalCode: { type: 'string' },
                    country: { type: 'string' },
                    countryCode: { type: 'string' },
                    metadata: { type: 'hash' },
                  },
                },
              },
            },
            birthdays: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    date: { type: 'hash' },
                    text: { type: 'string' },
                    metadata: { type: 'hash' },
                  },
                },
              },
            },
            urls: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    value: { type: 'string' },
                    type: { type: 'string' },
                    formattedType: { type: 'string' },
                    metadata: { type: 'hash' },
                  },
                },
              },
            },
            relations: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    person: { type: 'string' },
                    type: { type: 'string' },
                    formattedType: { type: 'string' },
                    metadata: { type: 'hash' },
                  },
                },
              },
            },
            biographies: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    value: { type: 'string' },
                    contentType: { type: 'string' },
                    metadata: { type: 'hash' },
                  },
                },
              },
            },
            photos: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    url: { type: 'string' },
                    default: { type: 'boolean' },
                    metadata: { type: 'hash' },
                  },
                },
              },
            },
            userDefined: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    key: { type: 'string' },
                    value: { type: 'string' },
                    metadata: { type: 'hash' },
                  },
                },
              },
            },
            events: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    date: { type: 'hash' },
                    type: { type: 'string' },
                    formattedType: { type: 'string' },
                    metadata: { type: 'hash' },
                  },
                },
              },
            },
            nicknames: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    value: { type: 'string' },
                    type: { type: 'string' },
                    metadata: { type: 'hash' },
                  },
                },
              },
            },
            memberships: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    contactGroupMembership: { type: 'hash' },
                    domainMembership: { type: 'hash' },
                    metadata: { type: 'hash' },
                  },
                },
              },
            },
            interests: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    value: { type: 'string' },
                    metadata: { type: 'hash' },
                  },
                },
              },
            },
            skills: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    value: { type: 'string' },
                    metadata: { type: 'hash' },
                  },
                },
              },
            },
            imClients: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    username: { type: 'string' },
                    type: { type: 'string' },
                    formattedType: { type: 'string' },
                    protocol: { type: 'string' },
                    formattedProtocol: { type: 'string' },
                    metadata: { type: 'hash' },
                  },
                },
              },
            },
            externalIds: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    value: { type: 'string' },
                    type: { type: 'string' },
                    formattedType: { type: 'string' },
                    metadata: { type: 'hash' },
                  },
                },
              },
            },
            clientData: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    key: { type: 'string' },
                    value: { type: 'string' },
                    metadata: { type: 'hash' },
                  },
                },
              },
            },
            metadata: {
              type: {
                type: 'hash',
                fields: {
                  sources: { type: 'list' },
                  previousResourceNames: { type: 'list' },
                  linkedPeopleResourceNames: { type: 'list' },
                  deleted: { type: 'boolean' },
                  objectType: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  } satisfies TQoreResponseType,
});

export default getContact;
