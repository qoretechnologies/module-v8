import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { OUTLOOK_APP_NAME } from '../constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { Contact } from '@microsoft/microsoft-graph-types';

const OutlookNewContactTrigger = QoreAppCreator.createLocalizedTrigger({
  app: OUTLOOK_APP_NAME,
  action: 'new-contact',
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;

    const missingValues: string[] = [];

    if (!token) missingValues.push('token');

    if (missingValues.length) {
      throw new Error(
        `All of the following ${missingValues.join(', ')} are required to start the new contact Outlook trigger`
      );
    }

    const getItems = () => {
      return getLastOutlookContacts(token!);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'outlook_new_contact',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;

    if (!token) {
      throw new Error('The token is required to get the new contact example data');
    }

    const contacts = await getLastOutlookContacts(token);

    return contacts?.length > 0 ? contacts[0] : null;
  },
  event_info: {
    desc: 'Outlook New Contact Trigger Event Info',
    type: {
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
  },
});

const getLastOutlookContacts = async (token: string) => {
  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token!),
    },
  });

  try {
    const response: PageCollection = await client
      .api('/me/contacts')
      .select('id,displayName,givenName,surname,emailAddresses,companyName,jobTitle')
      .top(DEFAULT_TRIGGER_POLL_ITEM_LIMIT)
      .orderby('displayName')
      .get();

    return response.value as Contact[];
  } catch (error) {
    throw new Error(`Failed to fetch Outlook contacts: ${error.message}`);
  }
};

export default OutlookNewContactTrigger;
