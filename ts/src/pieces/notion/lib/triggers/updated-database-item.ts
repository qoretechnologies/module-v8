import { Client } from '@notionhq/client';
import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../../global/constants';
import { pollUpdatedItemsForTrigger } from '../../../../global/helpers/event-triggers';
import { getNotionDatabaseIdAllowedValues } from '../common/helpers/get-database-id-allowed-values';
import { mapNotionProperties } from '../common/properties-mapping';
import { databaseItemQoreType, NOTION_FETCH_DELAY, NOTION_FETCH_MAX_RETRIES } from './constants';
import { Debugger } from '../../../../utils/Debugger';
import { delay } from '../../../../global/helpers';

const notionUpdatedDatabaseItemTrigger = QoreAppCreator.createLocalizedTrigger({
  app: 'Notion',
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
    const token = context.conn_opts?.token;
    const databaseId = context.opts?.databaseId;

    if (!token) {
      throw new Error('Notion token is required for updated_database_item event');
    }

    if (!databaseId) {
      throw new Error('Notion Database Id is required for updated_database_item event');
    }

    const getDatabaseItems = () => {
      return getLastUpdatedDatabaseItems(token, databaseId);
    };

    await pollUpdatedItemsForTrigger({
      trigger_name: 'notion_updated_database_item',
      uniqueField: 'id',
      updatedDateField: 'last_edited_time',
      getItems: getDatabaseItems,
      update,
      should_stop,
    });
  },
  event_info: {
    desc: 'Notion Database Item Updated Event Info',
    type: databaseItemQoreType,
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const databaseId = context?.opts?.databaseId;

    if (!token || !databaseId) return;

    const latestItems = await getLastUpdatedDatabaseItems(token, databaseId);

    return latestItems.length > 0 ? latestItems[0] : null;
  },
});

export const getLastUpdatedDatabaseItems = async (
  token: string,
  databaseId: string,
  limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT
) => {
  const notion = new Client({
    auth: token,
    notionVersion: '2022-02-22',
  });

  let retries = 0;

  while (true) {
    try {
      const response = await notion.databases.query({
        database_id: databaseId,
        sorts: [
          {
            timestamp: 'last_edited_time',
            direction: 'descending',
          },
        ],
        page_size: limit,
      });

      return response.results.map((item) => ({
        ...item,
        ...('properties' in item && { properties: mapNotionProperties(item.properties) }),
      }));
    } catch (error) {
      retries++;

      if (retries > NOTION_FETCH_MAX_RETRIES) {
        throw error;
      }

      Debugger.log(
        `Notion API Last updated database items request failed ` +
          `(attempt ${retries}/${NOTION_FETCH_MAX_RETRIES}). Reason:`,
        error
      );

      await delay(NOTION_FETCH_DELAY);
    }
  }
};

export default notionUpdatedDatabaseItemTrigger;
