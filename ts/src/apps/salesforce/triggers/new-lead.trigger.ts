import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { SALESFORCE_APP_NAME } from '../constants';
import { fetchSalesforceObjectRecords } from '../helpers/constants';

const salesforceNewLeadTrigger = QoreAppCreator.createLocalizedTrigger({
  app: SALESFORCE_APP_NAME,
  action: 'new_lead_trigger',
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;
    const instance_url = context.conn_opts?.instance_url;

    if (!token || !instance_url) {
      throw new Error('The token and instance_url are required to register Salesforce webhook');
    }

    const getLeads = () => {
      return getLastCreatedLead(token, instance_url);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'salesforce_new_lead_trigger',
      uniqueField: 'Id',
      getItems: getLeads,
      update,
      should_stop,
    });
  },
  event_info: {
    desc: 'Salesforce New Lead Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        Id: { type: 'string' },
      },
    },
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const instance_url = context?.conn_opts?.instance_url;

    if (!token || !instance_url) {
      throw new Error(
        'The token and instance_url are required to get Salesforce new lead example data'
      );
    }

    const data = await getLastCreatedLead(token, instance_url);

    return data?.length > 0 ? data[0] : null;
  },
});

const getLastCreatedLead = async (token: string, url: string): Promise<any> => {
  const lead = await fetchSalesforceObjectRecords({
    instanceUrl: url,
    token,
    query: `SELECT FIELDS(ALL) FROM Lead ORDER BY CreatedDate DESC LIMIT ${DEFAULT_TRIGGER_POLL_ITEM_LIMIT}`,
  });

  return lead;
};

export default salesforceNewLeadTrigger;
