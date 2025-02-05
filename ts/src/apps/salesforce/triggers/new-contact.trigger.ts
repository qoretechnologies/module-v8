import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { fetchSalesforceObjectRecords } from '../helpers/constants';

export default {
  action: 'new_contact_trigger',
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const {
      conn_opts: { token, instance_url },
    } = context;

    const getContacts = () => {
      return getLastCreatedContacts(token, instance_url);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'salesforce_new_contact_trigger',
      uniqueField: 'Id',
      getItems: getContacts,
      update,
      should_stop,
    });
  },
  event_info: {
    desc: 'Salesforce New Contact Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
      },
    },
  },
  get_example_event_data: async (context) => {
    const {
      conn_opts: { token, instance_url },
    } = context;

    const data = await getLastCreatedContacts(token, instance_url);

    return data?.length > 0 ? data[0] : null;
  },
} satisfies TQorePartialEventAction;

const getLastCreatedContacts = async (token: string, url: string): Promise<any> => {
  const contacts = await fetchSalesforceObjectRecords({
    instanceUrl: url,
    token,
    query: `SELECT FIELDS(ALL) FROM Contact ORDER BY CreatedDate DESC LIMIT ${DEFAULT_TRIGGER_POLL_ITEM_LIMIT}`,
  });

  return contacts;
};
