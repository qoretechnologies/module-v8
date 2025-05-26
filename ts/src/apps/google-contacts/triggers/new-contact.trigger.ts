import { people_v1 } from '@googleapis/people';
import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { GOOGLE_CONTACTS_APP_NAME, GoogleContactsError } from '../constants';
import { createGooglePeopleClient } from '../helpers/constants';
import { pick } from 'lodash';

const googleContactsNewContactTrigger = QoreAppCreator.createLocalizedTrigger({
  app: GOOGLE_CONTACTS_APP_NAME,
  action: 'new_contact',
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;

    if (!token) {
      throw new GoogleContactsError(
        'Token is required to start the new contact Google Contacts trigger'
      );
    }

    const getItems = () => {
      return getLatestGoogleContacts(token);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'google_contacts_new_contact',
      uniqueField: 'resourceName',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;

    if (!token) {
      throw new GoogleContactsError('Token is required to get the new contact example data');
    }

    try {
      const contacts = await getLatestGoogleContacts(token);
      return contacts?.length > 0 ? contacts[0] : null;
    } catch (error) {
      throw new GoogleContactsError(`Failed to fetch example contact: ${error}`);
    }
  },
  event_info: {
    desc: 'Google Contacts New Contact Trigger Event Info',
    type: {
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
        addresses: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                formattedValue: { type: 'string' },
                type: { type: 'string' },
                formattedType: { type: 'string' },
                streetAddress: { type: 'string' },
                city: { type: 'string' },
                region: { type: 'string' },
                postalCode: { type: 'string' },
                country: { type: 'string' },
                countryCode: { type: 'string' },
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
                type: { type: 'string' },
                formattedType: { type: 'string' },
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
                text: { type: 'string' },
                date: {
                  type: {
                    type: 'hash',
                    fields: {
                      year: { type: 'number' },
                      month: { type: 'number' },
                      day: { type: 'number' },
                    },
                  },
                },
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
              },
            },
          },
        },
        metadata: {
          type: {
            type: 'hash',
            fields: {
              sources: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      type: { type: 'string' },
                      id: { type: 'string' },
                      etag: { type: 'string' },
                      updateTime: { type: 'string' },
                    },
                  },
                },
              },
              objectType: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

const getLatestGoogleContacts = async (token: string): Promise<people_v1.Schema$Person[]> => {
  const client = createGooglePeopleClient(token);

  try {
    const response = await client.people.connections.list({
      resourceName: 'people/me',
      personFields:
        'names,emailAddresses,phoneNumbers,addresses,organizations,birthdays,urls,metadata',
      pageSize: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
      sortOrder: 'LAST_MODIFIED_DESCENDING',
    });

    return (response.data.connections || []).map((contact) => ({
      resourceName: contact.resourceName,
      etag: contact.etag,
      names:
        contact.names?.map((name) =>
          pick(name, [
            'displayName',
            'givenName',
            'familyName',
            'honorificPrefix',
            'honorificSuffix',
            'middleName',
          ])
        ) || [],
      emailAddresses: contact.emailAddresses || [],
      phoneNumbers:
        contact.phoneNumbers?.map((phone) => pick(phone, ['value', 'type', 'formattedType'])) || [],
      addresses:
        contact.addresses?.map((address) =>
          pick(address, [
            'formattedValue',
            'type',
            'formattedType',
            'streetAddress',
            'city',
            'region',
            'postalCode',
            'country',
          ])
        ) || [],
      organizations:
        contact.organizations?.map((org) =>
          pick(org, ['name', 'title', 'department', 'type', 'formattedType'])
        ) || [],
      birthdays:
        contact.birthdays?.map((birthday) => ({
          text: birthday.text,
          date: birthday.date
            ? {
                year: birthday.date.year,
                month: birthday.date.month,
                day: birthday.date.day,
              }
            : undefined,
        })) || [],
      urls:
        contact.urls?.map((url) => ({
          value: url.value,
          type: url.type,
          formattedType: url.formattedType,
        })) || [],
      metadata: {
        sources: contact.metadata?.sources || [],
        objectType: contact.metadata?.objectType,
      },
    }));
  } catch (error) {
    throw new GoogleContactsError(`Failed to fetch Google contacts: ${error}`);
  }
};

export default googleContactsNewContactTrigger;
