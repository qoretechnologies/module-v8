import {
  EQoreAppActionCode,
  QorusRequest,
  TQorePartialEventAction,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';

export default {
  action: 'new_record',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    recordType: {
      type: 'string',
      required_groups: ['new_record_trigger'],
    },
  },
  event_function: async (context, update, should_stop) => {
    const token = context?.conn_opts?.token;
    const account_id = context?.conn_opts?.account_id;
    const recordType = context?.opts?.recordType;

    if (!token || !account_id || !recordType) {
      throw new Error(
        'The token, account_id, and recordType are required to register NetSuite webhook'
      );
    }

    try {
      let previousItem = await getLastCreatedRecordItem(recordType, account_id, token);

      while (!should_stop()) {
        const latestItem = await getLastCreatedRecordItem(recordType, account_id, token);

        if (previousItem?.id !== latestItem.id) {
          update(latestItem);
        }
        previousItem = latestItem;

        await new Promise((resolve) => setTimeout(resolve, 30_000));
      }
    } catch (error) {
      Debugger.log('Error in netsuite new_record event_function', error);
    }
  },
  event_info: {
    desc: 'NetSuite New Record Event Info',
    type: {
      type: 'hash',
    },
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const account_id = context?.conn_opts?.account_id;
    const recordType = context?.opts?.recordType;

    if (!token || !account_id || !recordType) {
      throw new Error(
        'The token, account_id, and recordType are required to get NetSuite new record example data'
      );
    }

    return await getLastCreatedRecordItem(recordType, account_id, token);
  },
} satisfies TQorePartialEventAction;

const getLastCreatedRecordItem = async (recordType: string, accountId: string, token: string) => {
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
        limit: '1',
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
