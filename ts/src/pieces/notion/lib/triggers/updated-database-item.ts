import { Client } from '@notionhq/client';
import { EQoreAppActionCode, TQorePartialEventAction } from '../../../../global/models/qore';
import { databaseItemQoreType } from './constants';
import { getNotionDatabaseIdAllowedValues } from '../common/helpers/get-database-id-allowed-values';
import { Debugger } from '../../../../utils/Debugger';

export default {
  action: 'updated_database_item',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    databaseId: {
      required: true,
      get_allowed_values: getNotionDatabaseIdAllowedValues,
      type: 'string',
    },
  },
  event_function: async (context, update, should_stop) => {
    const {
      conn_opts: { token },
      opts: { databaseId },
    } = context;

    try {
      let previousItem = await getLastUpdatedDatabaseItem(token, databaseId);

      while (!should_stop()) {
        const latestItem = await getLastUpdatedDatabaseItem(token, databaseId);
        if (previousItem?.id !== latestItem.id) {
          update(latestItem);
        }
        previousItem = latestItem;

        await new Promise((resolve) => setTimeout(resolve, 30_000));
      }
    } catch (error) {
      Debugger.log('Error in updated_database_item event_function', error);
    }
  },
  event_info: {
    desc: 'Notion Database Item Updated Event Info',
    type: databaseItemQoreType,
  },
  get_example_event_data: async (context) => {
    const {
      conn_opts: { token },
      opts: { databaseId },
    } = context;

    const latestItem = await getLastUpdatedDatabaseItem(token, databaseId);

    return latestItem;
  },
} satisfies TQorePartialEventAction;

export const getLastUpdatedDatabaseItem = async (token: string, databaseId: string) => {
  const notion = new Client({
    auth: token,
    notionVersion: '2022-02-22',
  });

  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        timestamp: 'last_edited_time',
        direction: 'descending',
      },
    ],
    page_size: 1,
  });

  return response.results[0];
};
