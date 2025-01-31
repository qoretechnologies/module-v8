import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollUpdatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { fetchSalesforceObjectRecords } from '../helpers/constants';
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

    const getUpdatedRecord = () => {
      return getLastUpdatedRecords(token, instance_url, object);
    };

    await pollUpdatedItemsForTrigger({
      trigger_name: 'salesforce_updated_record_trigger',
      uniqueField: 'Id',
      updatedDateField: 'LastModifiedDate',
      getItems: getUpdatedRecord,
      update,
      should_stop,
    });
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

    const data = await getLastUpdatedRecords(token, instance_url, object);

    return data?.length > 0 ? data[0] : null;
  },
} satisfies TQorePartialEventAction;

export const getLastUpdatedRecords = async (
  token: string,
  url: string,
  object: string
): Promise<any> => {
  const records = await fetchSalesforceObjectRecords({
    instanceUrl: url,
    token,
    query: `SELECT FIELDS(ALL) FROM ${object} ORDER BY LastModifiedDate DESC LIMIT ${DEFAULT_TRIGGER_POLL_ITEM_LIMIT}`,
  });

  return records;
};
