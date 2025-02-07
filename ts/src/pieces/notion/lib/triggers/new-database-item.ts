import { Client } from '@notionhq/client';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../../global/helpers/event-triggers';
import { EQoreAppActionCode, TQorePartialEventAction } from '@qoretechnologies/ts-toolkit';
import { getNotionDatabaseIdAllowedValues } from '../common/helpers/get-database-id-allowed-values';
import { databaseItemQoreType } from './constants';

export default {
  action: 'new_database_item',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    databaseId: {
      required: true,
      get_allowed_values: getNotionDatabaseIdAllowedValues,
      type: 'string',
    },
  },
  event_function: async (context, update, should_stop) => {
    const token = context.conn_opts?.token;
    const databaseId = context.opts?.databaseId;

    if (!token) {
      throw new Error('Notion token is required for updated_database_item event');
    }

    if (!databaseId) {
      throw new Error('Notion Database Id is required for updated_database_item event');
    }

    const getDatabaseItems = () => {
      return getLastCreatedDatabaseItems(token, databaseId, DEFAULT_TRIGGER_POLL_ITEM_LIMIT);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'notion_new_database_item',
      uniqueField: 'id',
      getItems: getDatabaseItems,
      update,
      should_stop,
    });
  },
  event_info: {
    desc: 'Notion New Database Item Event Info',
    type: databaseItemQoreType,
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const databaseId = context?.opts?.databaseId;

    if (!token || !databaseId) return;

    const latestItems = await getLastCreatedDatabaseItems(token, databaseId, 1);

    return latestItems?.length > 0 ? latestItems[0] : null;
  },
} satisfies TQorePartialEventAction;

export const getLastCreatedDatabaseItems = async (
  token: string,
  databaseId: string,
  limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT
) => {
  const notion = new Client({
    auth: token,
    notionVersion: '2022-02-22',
  });

  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        timestamp: 'created_time',
        direction: 'descending',
      },
    ],
    page_size: limit,
  });

  return response.results;
};
