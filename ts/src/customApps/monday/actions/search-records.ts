import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { MONDAY_APP_NAME } from '../constants';
import { callMondayAPI } from './constants';
import { getMondayBoardIdAllowedValues } from './helpers/get-board-id-allowed-values';
import { getMondayColumnIdAllowedValues } from './helpers/get-column-id-allowed-values';
import { getMondaySingleColumnAllowedValues } from './helpers/get-column-allowed-values';

type TSearchRecordsResponse = {
  data: {
    items_page_by_column_values: {
      cursor: string;
      items: {
        id: string;
        name: string;
      }[];
    };
  };
};

const options = {
  board_id: {
    display_name: 'Board ID',
    short_desc: 'The ID of the board to search for records in.',
    desc: 'The unique identifier of the board containing the records you want to search for.',

    type: 'string',
    required: false,
    preselected: true,
    on_change: ['refetch'],
    allowed_values_creatable: true,
    get_allowed_values: getMondayBoardIdAllowedValues,
  },
  query_text: {
    display_name: 'Query',
    short_desc: 'The search query to use.',
    desc: 'The search query to use to find records.',

    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getMondaySingleColumnAllowedValues,
    required: true,
  },
  columnId: {
    display_name: 'Column ID',
    short_desc: 'The ID of the column to search in.',
    desc: 'The unique identifier of the column to search in.',

    type: 'string',
    required: false,
    default_value: 'name',
    allowed_values_creatable: true,
    on_change: ['refetch'],
    get_allowed_values: getMondayColumnIdAllowedValues,
  },
  limit: {
    display_name: 'Limit',
    short_desc: 'The maximum number of records to return.',
    desc: 'The maximum number of records to return.',

    type: 'number',
    required: false,
    default_value: 10,
  },
  cursor: {
    display_name: 'Cursor',
    short_desc: 'The cursor to use for pagination.',
    desc: 'The cursor to use for pagination.',

    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    items: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            id: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
          },
        },
      },
    },
    cursor: {
      type: 'string',
    },
  },
} satisfies TQoreResponseType;

export const SearchRecords = QoreAppCreator.createAction({
  action: 'search-records',
  app: MONDAY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  display_name: 'Search Records',
  short_desc: 'Find records matching specific criteria.',
  desc:
    'This action allows you to search for records that meet defined criteria, ' +
    'such as specific column values or statuses, and returns a list of matching records.',

  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const url = context?.conn_opts?.url;
    const boardId = data?.board_id;
    const queryText = data?.query_text;
    const limit = data?.limit || 10;
    const cursor = data?.cursor;
    const columnId = data?.columnId || 'name';

    if (!boardId || !token || !url || !queryText) {
      throw new Error(
        'board_id, search_query token and api url are required to search for Monday app records.'
      );
    }

    const query = `
    query SearchItems($boardId: ID!, $queryText: String!, $cursor: String, $limit: Int!, $columnId: String!) {
      items_page_by_column_values(
        board_id: $boardId,
        columns: [{ column_id: $columnId, column_values: [$queryText] }],
        limit: $limit
        cursor: $cursor
      ) {
        cursor,
        items {
          id
          name
        }
      }
    }
  `;

    const results = await callMondayAPI<TSearchRecordsResponse>({
      url,
      query,
      variables: {
        boardId,
        queryText,
        limit,
        columnId,
        ...(cursor && { cursor }),
      },
      token,
    });

    return {
      items: results.data.items_page_by_column_values.items,
      cursor: results.data.items_page_by_column_values.cursor,
    };
  },
  options,
  response_type,
});
