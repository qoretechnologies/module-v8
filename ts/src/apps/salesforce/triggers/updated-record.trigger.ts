import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { fetchSalesforceObjectRecord } from '../helpers/constants';
import { getSalesforceObjectAllowedValues } from '../helpers/get-object-allowed-values';

export default {
  action: 'updated_record_trigger',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    object: {
      required: true,
      type: 'string',
      get_allowed_values: getSalesforceObjectAllowedValues,
    },
  },
  event_function: async (context, update, should_stop) => {
    const {
      conn_opts: { token, instance_url },
      opts: { object },
    } = context;

    try {
      let previousItem = await getLastUpdatedRecord(token, instance_url, object);

      while (!should_stop()) {
        const latestItem = await getLastUpdatedRecord(token, instance_url, object);
        if (previousItem?.Id !== latestItem.Id) {
          update(latestItem);
        }
        previousItem = latestItem;

        await new Promise((resolve) => setTimeout(resolve, 30_000));
      }
    } catch (error) {
      Debugger.log('Error in updated_record_trigger event_function', error);
    }
  },
  event_info: {
    desc: 'Salesforce Updated Record Trigger Event Info',
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
      opts: { object },
    } = context;

    const data = await getLastUpdatedRecord(token, instance_url, object);

    return data;
  },
} satisfies TQorePartialEventAction;

export const getLastUpdatedRecord = async (
  token: string,
  url: string,
  object: string
): Promise<any> => {
  const record = await fetchSalesforceObjectRecord({
    instanceUrl: url,
    token,
    query: `SELECT FIELDS(ALL) FROM ${object} ORDER BY LastModifiedDate DESC LIMIT 1`,
  });

  return record;
};
