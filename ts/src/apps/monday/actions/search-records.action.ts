import {
  EQoreAppActionCode,
  IQoreTypeObjectNonList,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { MONDAY_APP_NAME } from '../constants';
import { callMondayAPI, formatMondayRecordResponse } from '../helpers/constants';
import { getMondayBoardFieldsResponseType } from '../helpers/get-board-fields';
import { getMondayBoardIdAllowedValues } from '../helpers/get-board-id-allowed-values';
import { getMondaySingleColumnAllowedValues } from '../helpers/get-column-allowed-values';
import { getMondayColumnIdAllowedValues } from '../helpers/get-column-id-allowed-values';
import { TMondayItem } from '../helpers/record-based/constants';

type TSearchRecordsResponse = {
  data: {
    items_page_by_column_values: {
      cursor: string;
      items: Array<TMondayItem>;
    };
  };
};

const options = {
  board_id: {
    type: 'string',
    required: false,
    preselected: true,
    on_change: ['refetch'],
    allowed_values_creatable: true,
    get_allowed_values: getMondayBoardIdAllowedValues,
  },
  query_text: {
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getMondaySingleColumnAllowedValues,
    required: true,
  },
  columnId: {
    type: 'string',
    required: false,
    default_value: 'name',
    allowed_values_creatable: true,
    on_change: ['refetch'],
    get_allowed_values: getMondayColumnIdAllowedValues,
  },
  limit: {
    type: 'number',
    required: false,
    default_value: 10,
  },
  cursor: {
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

const SearchRecords = QoreAppCreator.createLocalizedAction({
  action: 'search_records',
  app: MONDAY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,

  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const boardId = data?.board_id;
    const queryText = data?.query_text;
    const limit = data?.limit || 10;
    const cursor = data?.cursor;
    const columnId = data?.columnId || 'name';

    if (!boardId || !token || !queryText) {
      throw new Error(
        'board_id, search_query token are required to search for Monday app records.'
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
          created_at
          updated_at
          column_values {
            id
            text
            value
            type
            column {
              title
              settings
            }
          }
        }
      }
    }
  `;

    const results = await callMondayAPI<TSearchRecordsResponse>({
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
      items: formatMondayRecordResponse(results.data.items_page_by_column_values.items),
      cursor: results.data.items_page_by_column_values.cursor,
    };
  },
  options,
  response_type,
  get_dynamic_response_type: async (context) => {
    const itemResponseType = await getMondayBoardFieldsResponseType(context);

    return {
      type: 'hash',
      fields: {
        items: {
          type: {
            type: 'list',
            element_type: itemResponseType as IQoreTypeObjectNonList,
          },
        },
        cursor: {
          type: 'string',
        },
      },
    };
  },
});

export default SearchRecords;
