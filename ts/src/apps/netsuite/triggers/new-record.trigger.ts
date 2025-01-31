import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { Debugger } from '../../../utils/Debugger';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';

export default {
  action: 'new_record',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    recordType: {
      type: 'string',
      required: true,
      required_groups: ['new_record_trigger'],
    },
  },
  event_function: async (context, update, should_stop) => {
    const {
      conn_opts: { token, account_id },
      opts: { recordType },
    } = context;

    const getRecords = () => {
      return getLastCreatedRecordItems(recordType, account_id, token);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'netsuite_new_record',
      uniqueField: 'id',
      getItems: getRecords,
      update,
      should_stop,
    });
  },
  event_info: {
    desc: 'NetSuite New Record Event Info',
    type: {
      type: 'hash',
    },
  },
  get_example_event_data: async (context) => {
    const {
      conn_opts: { token, account_id },
      opts: { recordType },
    } = context;

    const data = await getLastCreatedRecordItems(recordType, account_id, token);

    return data?.length > 0 ? data[0] : null;
  },
} satisfies TQorePartialEventAction;

const getLastCreatedRecordItems = async (recordType: string, accountId: string, token: string) => {
  try {
    const result = await fetchSuiteQlData({
      token,
      accountId,
      query: `SELECT * FROM ${recordType} ORDER BY datecreated DESC`,
    });

    return result.items[0];
  } catch (error) {
    Debugger.log('Error while fetching NetSuite record', error);

    const result = await fetchSuiteQlData({
      token,
      accountId,
      query: `SELECT * FROM ${recordType} ORDER BY createddate DESC`,
    });

    return result.items[0];
  }
};

const fetchSuiteQlData = async ({
  token,
  accountId,
  query,
}: {
  token: string;
  accountId: string;
  query: string;
}) => {
  const { data } = await QorusRequest.post<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Prefer: 'transient',
      },
      path: `/services/rest/query/v1/suiteql`,
      params: {
        limit: DEFAULT_TRIGGER_POLL_ITEM_LIMIT.toString(),
      },
      data: {
        q: query,
      },
    },
    {
      endpointId: 'NetSuite',
      url: `https://${accountId}.suitetalk.api.netsuite.com`,
    }
  );

  return data;
};
