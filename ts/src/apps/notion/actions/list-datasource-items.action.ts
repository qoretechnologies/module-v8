import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { NOTION_APP_NAME, NotionError } from '../constants';
import { createNotionClient, mapNotionPropertiesToSimpleObject } from '../helpers/constants';
import { formatNotionFilterValues } from '../helpers/format-filter-values';
import {
  getNotionDataSourceProperties,
  getNotionDataSourceResponseType,
} from '../helpers/get-data-source-properties';
import { getNotionDataSourcePropertiesAllowedValues } from '../helpers/get-data-source-properties-allowed-values';
import { getNotionDataSourceAllowedValues } from '../helpers/get-datasource-allowed-values';
import { DataSourceObjectResponse } from '@notionhq/client';

type NotionSortsType = Array<
  | {
      property: string;
      direction: 'ascending' | 'descending';
    }
  | {
      timestamp: 'created_time' | 'last_edited_time';
      direction: 'ascending' | 'descending';
    }
>;

const action = 'list_datasource_items';

const options = {
  data_source_id: {
    type: 'string',
    required: true,
    get_allowed_values: getNotionDataSourceAllowedValues,
    on_change: ['refetch'],
  },
  page_size: {
    type: 'integer',
    required: false,
    default_value: 50,
  },
  next_cursor: {
    type: 'string',
    required: false,
  },
  filter_properties: {
    type: 'hash',
    required: false,
    depends_on: ['data_source_id'],
    get_dynamic_type: getNotionDataSourceProperties,
  },
  sorts: {
    allowed_values_creatable: true,
    allowed_values: [
      {
        value: [{ timestamp: 'created_time', direction: 'descending' }],
        display_name: 'Created (Newest First)',
      },
      {
        value: [{ timestamp: 'created_time', direction: 'ascending' }],
        display_name: 'Created (Oldest First)',
      },
      {
        value: [{ timestamp: 'last_edited_time', direction: 'descending' }],
        display_name: 'Last Edited (Newest First)',
      },
      {
        value: [{ timestamp: 'last_edited_time', direction: 'ascending' }],
        display_name: 'Last Edited (Oldest First)',
      },
    ],
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          property: {
            type: 'string',
            required: false,
            allowed_values_creatable: true,
            get_allowed_values: getNotionDataSourcePropertiesAllowedValues,
          },
          timestamp: {
            type: 'string',
            required: false,
            allowed_values: [
              { value: 'created_time', display_name: 'Created Time' },
              { value: 'last_edited_time', display_name: 'Last Edited Time' },
            ],
          },
          direction: {
            type: 'string',
            required: false,
            default_value: 'descending',
            allowed_values: [
              { value: 'ascending', display_name: 'Ascending' },
              { value: 'descending', display_name: 'Descending' },
            ],
          },
        },
      },
    },
    depends_on: ['data_source_id'],
    required: false,
  },
} satisfies TQoreOptions;

const elementType = {
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
    in_trash: {
      type: 'bool',
      example_value: false,
    },
    is_locked: {
      type: 'bool',
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
} satisfies TQoreTypeObject;

const listDataSourceItems = QoreAppCreator.createLocalizedAction<typeof options>({
  app: NOTION_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, data_source_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['data_source_id'],
      ErrorClass: NotionError,
    });

    const { page_size = 50, next_cursor, sorts, filter_properties = {} } = obj || {};

    try {
      const client = createNotionClient(token);

      const { properties } = await client.dataSources.retrieve({
        data_source_id,
      });

      const filterArray = formatNotionFilterValues(properties, filter_properties);

      const response = await client.dataSources.query({
        ...(sorts?.length && {
          sorts: sorts as NotionSortsType,
        }),
        data_source_id,
        start_cursor: next_cursor,
        page_size,
        ...(filterArray.length > 0 && {
          filter: {
            and: filterArray,
          },
        }),
      });

      const results = response.results.map((item: DataSourceObjectResponse) => ({
        ...item,
        properties: mapNotionPropertiesToSimpleObject(item.properties),
      }));

      return omit({ ...response, results }, ['type', 'page_or_data_source']);
    } catch (error) {
      throw new NotionError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      next_cursor: { type: 'string', example_value: 'd8f3f2c3-8b4d-4e0d-9f1b-1c3e5f6a7b8c' },
      has_more: { type: 'bool', example_value: false },
      results: {
        type: {
          type: 'list',
          element_type: elementType,
        },
      },
    },
  } satisfies TQoreResponseType,
  get_dynamic_response_type: async (context) => {
    const propertiesType = await getNotionDataSourceResponseType(context);

    return {
      type: 'hash',
      fields: {
        next_cursor: { type: 'string', example_value: 'd8f3f2c3-8b4d-4e0d-9f1b-1c3e5f6a7b8c' },
        has_more: { type: 'bool', example_value: false },
        results: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                ...elementType.fields,
                properties: { type: propertiesType as TQoreTypeObject },
              },
            },
          },
        },
      },
    };
  },
});

export default listDataSourceItems;
