import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { BREVO_APP_NAME, BrevoError } from '../constants';
import { createBrevoClient } from '../helpers/constants';
import { getBrevoListAllowedValues } from '../helpers/get-list-allowed-values';

const BrevoNewContactTrigger = QoreAppCreator.createLocalizedTrigger({
  app: BREVO_APP_NAME,
  action: 'new_contact',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    listIds: {
      type: {
        type: 'list',
        element_type: 'number',
      },
      required: false,
      get_element_allowed_values: getBrevoListAllowedValues,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: BrevoError,
    });

    const listIds = context?.opts?.listIds;

    const getItems = () => {
      return fetchLatestContacts(token, listIds);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'brevo_new_contact',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: BrevoError,
    });

    const listIds = context?.opts?.listIds;
    const contacts = await fetchLatestContacts(token, listIds);

    return contacts?.length > 0 ? contacts[0] : null;
  },
  event_info: {
    desc: 'Brevo New Contact Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'number' },
        email: { type: 'string' },
        emailBlacklisted: { type: 'boolean' },
        smsBlacklisted: { type: 'boolean' },
        createdAt: { type: 'string' },
        modifiedAt: { type: 'string' },
        listIds: {
          type: {
            type: 'list',
            element_type: 'number',
          },
        },
        attributes: {
          type: {
            type: 'hash',
            fields: {
              FIRSTNAME: { type: 'string' },
              LASTNAME: { type: 'string' },
              SMS: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

const fetchLatestContacts = async (token: string, listIds?: number[]) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const client = createBrevoClient(token);

    const response = await client.contactsClient.getContacts(
      limit,
      0,
      undefined,
      undefined,
      'desc',
      undefined,
      listIds
    );

    return response.body.contacts || [];
  } catch (error) {
    throw new BrevoError(`Failed to fetch latest contacts: ${error.message || error}`);
  }
};

export default BrevoNewContactTrigger;
