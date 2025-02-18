import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { MONDAY_APP_NAME } from '../constants';
import { getMondayBoardIdAllowedValues } from './helpers/get-board-id-allowed-values';
import { getMondayRecordIdAllowedValues } from './helpers/get-record-id-allowed-values';
import { callMondayAPI } from './constants';

type TGetRecordResponseType = {
  data: {
    items: {
      id: string;
      name: string;
      column_values: { id: string; text: string; value: string }[];
    }[];
  };
};

const options = {
  board_id: {
    display_name: 'Board ID',
    short_desc: 'The ID of the board containing the record to get.',
    desc: 'The unique identifier of the board containing the record you want to get.',

    type: 'string',
    required: false,
    preselected: true,
    on_change: ['refetch'],
    allowed_values_creatable: true,
    get_allowed_values: getMondayBoardIdAllowedValues,
  },
  record_id: {
    display_name: 'Record ID',
    short_desc: 'The ID of the record to get.',
    desc: 'The unique identifier of the record you want to get.',

    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getMondayRecordIdAllowedValues,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    id: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    column_values: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            id: {
              type: 'string',
            },
            text: {
              type: 'string',
            },
            value: {
              type: 'hash',
            },
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;

export const GetRecord = QoreAppCreator.createAction({
  action: 'get-record',
  app: MONDAY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,
  display_name: 'Get Record',
  short_desc: 'Retrieve details of a specific record.',
  desc: 'This action fetches the details of a specified record, including all column values and associated metadata.',

  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const url = context?.conn_opts?.url;
    const recordId = data?.record_id;

    if (!recordId || !token || !url) {
      throw new Error('record_id, token and api url are required to get a Monday app record.');
    }

    const query = `
    query GetItem($recordId: [ID!]!) {
      items(ids: $recordId) {
        id
        name
        column_values {
          id
          text
          value
        }
      }
    }
  `;

    const result = await callMondayAPI<TGetRecordResponseType>({
      query,
      token,
      url,
      variables: { recordId },
    });

    const item = result?.data?.items?.[0];

    if (!item) {
      throw new Error('The requested record was not found.');
    }

    item.column_values = item.column_values.map((columnValue) => ({
      ...columnValue,
      value: JSON.parse(columnValue.value),
    }));

    return item;
  },
  options,
  response_type,
});
