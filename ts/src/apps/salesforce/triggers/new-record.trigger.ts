import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { SALESFORCE_APP_NAME } from '../constants';
import { fetchSalesforceObjectRecords } from '../helpers/constants';
import { getSalesforceObjectAllowedValues } from '../helpers/get-object-allowed-values';

const salesforceNewRecordTrigger = QoreAppCreator.createLocalizedTrigger({
  app: SALESFORCE_APP_NAME,
  action: 'new_record_trigger',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    object: {
      required: true,
      type: 'string',
      get_allowed_values: getSalesforceObjectAllowedValues,
    },
  },
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;
    const instance_url = context.conn_opts?.instance_url;
    const object = context.opts?.object;

    if (!token || !instance_url || !object) {
      throw new Error(
        'The token, instance_url, and object are required to register Salesforce webhook'
      );
    }

    const getRecords = () => {
      return getLastCreatedRecords(token, instance_url, object);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'salesforce_new_record_trigger',
      uniqueField: 'Id',
      getItems: getRecords,
      update,
      should_stop,
    });
  },
  event_info: {
    desc: 'Salesforce New Record Trigger Event Info',
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
    const object = context?.opts?.object;

    if (!token || !instance_url || !object) {
      throw new Error(
        'The token, instance_url, and object are required to get Salesforce new record example data'
      );
    }

    const data = await getLastCreatedRecords(token, instance_url, object);

    return data?.length > 0 ? data[0] : null;
  },
});

export const getLastCreatedRecords = async (
  token: string,
  url: string,
  object: string
): Promise<any> => {
  const record = await fetchSalesforceObjectRecords({
    token,
    instanceUrl: url,
    query: `SELECT FIELDS(ALL) FROM ${object} ORDER BY CreatedDate DESC LIMIT ${DEFAULT_TRIGGER_POLL_ITEM_LIMIT}`,
  });

  return record;
};

export default salesforceNewRecordTrigger;
