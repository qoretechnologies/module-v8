import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollUpdatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { SALESFORCE_APP_NAME } from '../constants';
import { fetchSalesforceObjectRecords } from '../helpers/constants';
import { getSalesforceObjectAllowedValues } from '../helpers/get-object-allowed-values';

const salesforceUpdatedRecordTrigger = QoreAppCreator.createLocalizedTrigger({
  app: SALESFORCE_APP_NAME,
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
    const token = context.conn_opts?.token;
    const instance_url = context.conn_opts?.instance_url;
    const object = context.opts?.object;

    if (!token || !instance_url || !object) {
      throw new Error(
        'The token, instance_url, and object are required to register Salesforce webhook'
      );
    }

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
    const token = context?.conn_opts?.token;
    const instance_url = context?.conn_opts?.instance_url;
    const object = context?.opts?.object;

    if (!token || !instance_url || !object) {
      throw new Error(
        'The token, instance_url, and object are required to get Salesforce updated record example data'
      );
    }

    const data = await getLastUpdatedRecords(token, instance_url, object);

    return data?.length > 0 ? data[0] : null;
  },
});

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

export default salesforceUpdatedRecordTrigger;
