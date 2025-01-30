import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { fetchSalesforceObjectRecord } from '../helpers/constants';

export default {
  action: 'new_lead_trigger',
  action_code: EQoreAppActionCode.EVENT,
  event_function: async (context, update, should_stop) => {
    const {
      conn_opts: { token, instance_url },
    } = context;

    try {
      let previousLead = await getLastCreatedLead(token, instance_url);

      while (!should_stop()) {
        const latestLead = await getLastCreatedLead(token, instance_url);
        if (previousLead?.id !== latestLead.id) {
          update(latestLead);
        }
        previousLead = latestLead;

        await new Promise((resolve) => setTimeout(resolve, 30_000));
      }
    } catch (error) {
      Debugger.log('Error in new_lead_trigger event_function', error);
    }
  },
  event_info: {
    desc: 'Salesforce New Lead Trigger Event Info',
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

    const data = await getLastCreatedLead(token, instance_url);

    return data;
  },
} satisfies TQorePartialEventAction;

const getLastCreatedLead = async (token: string, url: string): Promise<any> => {
  const lead = await fetchSalesforceObjectRecord({
    instanceUrl: url,
    token,
    query: `SELECT FIELDS(ALL) FROM Lead ORDER BY CreatedDate DESC LIMIT 1`,
  });

  return lead;
};
