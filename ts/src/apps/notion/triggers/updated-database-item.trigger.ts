import { DataSourceObjectResponse } from '@notionhq/client';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { pollUpdatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { NOTION_APP_NAME, NotionError } from '../constants';
import { createNotionClient } from '../helpers/constants';
import { formatNotionFilterValues } from '../helpers/format-filter-values';
import { getNotionDataSourceProperties } from '../helpers/get-data-source-properties';
import { getNotionDataSourceAllowedValues } from '../helpers/get-datasource-allowed-values';

const action = 'updated_database_item';

const options = {
  data_source_id: {
    type: 'string',
    required: true,
    get_allowed_values: getNotionDataSourceAllowedValues,
    on_change: ['refetch'],
  },
  filter_properties: {
    type: 'hash',
    required: false,
    get_dynamic_type: getNotionDataSourceProperties,
  },
} satisfies TQoreOptions;

const UpdatedDatabaseItem = QoreAppCreator.createLocalizedTrigger({
  app: NOTION_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, data_source_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['data_source_id'],
      ErrorClass: NotionError,
    });

    const { filter_properties = {} } = context?.opts || {};

    const client = createNotionClient(token);

    const { properties } = await client.dataSources.retrieve({
      data_source_id,
    });

    const filterArray = formatNotionFilterValues(properties, filter_properties);

    const getItems = () => {
      return fetchLatestDataSourceItems({
        token,
        data_source_id,
        filterArray,
      });
    };

    await pollUpdatedItemsForTrigger({
      trigger_name: `notion_${action}`,
      uniqueField: 'id',
      updatedDateField: 'last_edited_time',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, data_source_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['data_source_id'],
      ErrorClass: NotionError,
    });

    const { filter_properties = {} } = context?.opts || {};

    const client = createNotionClient(token);

    const { properties } = await client.dataSources.retrieve({
      data_source_id,
    });

    const items = await fetchLatestDataSourceItems({
      token,
      data_source_id,
      filterArray: formatNotionFilterValues(properties, filter_properties),
    });

    return items?.length ? items[0] : null;
  },
  event_info: {
    desc: `Notion ${humanizeNameTitle(action)} Trigger Event Info`,
    type: {
      type: 'hash',
      fields: {
        object: {
          type: 'string',
          example_value: 'page',
        },
        id: {
          type: 'string',
          example_value: '19fba26f-2e25-803b-805b-fa2742f17b01',
        },
        created_time: {
          type: 'string',
          example_value: '2025-02-19T17:36:00.000Z',
        },
        last_edited_time: {
          type: 'string',
          example_value: '2025-02-19T17:36:00.000Z',
        },
        created_by: {
          type: {
            type: 'hash',
            fields: {
              object: {
                type: 'string',
                example_value: 'user',
              },
              id: {
                type: 'string',
                example_value: 'fe16ba92-b9bd-41ee-9496-ff853a1cd6d2',
              },
            },
          },
        },
        last_edited_by: {
          type: {
            type: 'hash',
            fields: {
              object: {
                type: 'string',
                example_value: 'user',
              },
              id: {
                type: 'string',
                example_value: 'fe16ba92-b9bd-41ee-9496-ff853a1cd6d2',
              },
            },
          },
        },
        icon: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              emoji: { type: 'string' },
              file: {
                type: {
                  type: 'hash',
                  fields: {
                    url: { type: 'string' },
                    expiry_time: { type: 'string' },
                  },
                },
              },
              custom_emoji: {
                type: {
                  type: 'hash',
                  fields: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    url: { type: 'string' },
                  },
                },
              },
              external: {
                type: {
                  type: 'hash',
                  fields: {
                    url: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        cover: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              external: {
                type: {
                  type: 'hash',
                  fields: {
                    url: { type: 'string' },
                  },
                },
              },
              file: {
                type: {
                  type: 'hash',
                  fields: {
                    url: { type: 'string' },
                    expiry_time: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        parent: {
          type: {
            type: 'hash',
            fields: {
              type: {
                type: 'string',
                example_value: 'data_source_id',
              },
              data_source_id: {
                type: 'string',
                example_value: '105ba26f-2e25-8087-9359-000b0bf6f1c3',
              },
              database_id: {
                type: 'string',
                example_value: '105ba26f-2e25-80ed-8f60-cdb2e63e740f',
              },
            },
          },
        },
        archived: {
          type: 'boolean',
          example_value: false,
        },
        in_trash: {
          type: 'boolean',
          example_value: false,
        },
        is_locked: {
          type: 'boolean',
          example_value: false,
        },
        properties: {
          type: 'hash',
        },
        url: {
          type: 'string',
          example_value: 'https://www.notion.so/Another-task-19fba26f2e25803b805bfa2742f17b01',
        },
        public_url: {
          type: 'string',
        },
      },
    },
  },
});

const fetchLatestDataSourceItems = async (options: {
  token: string;
  data_source_id: string;
  filterArray?: any[];
}): Promise<DataSourceObjectResponse[]> => {
  const maxResults = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  const { token, filterArray, data_source_id } = options;

  try {
    const client = createNotionClient(token);

    const response = await client.dataSources.query({
      sorts: [
        {
          direction: 'descending',
          timestamp: 'last_edited_time',
        },
      ],
      data_source_id,
      page_size: maxResults,
      ...(filterArray?.length && {
        filter: {
          and: filterArray,
        },
      }),
    });

    return response.results as DataSourceObjectResponse[];
  } catch (error) {
    throw new NotionError(`Failed to fetch latest database items: ${error.message || error}`);
  }
};

export default UpdatedDatabaseItem;
