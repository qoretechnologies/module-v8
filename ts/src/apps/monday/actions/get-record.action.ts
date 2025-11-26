import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { MONDAY_APP_NAME } from '../constants';
import { callMondayAPI, formatMondayRecordResponse } from '../helpers/constants';
import { getMondayBoardIdAllowedValues } from '../helpers/get-board-id-allowed-values';
import { getMondayRecordIdAllowedValues } from '../helpers/get-record-id-allowed-values';
import { TMondayItem } from '../helpers/record-based/constants';

type TGetRecordResponseType = {
  data: {
    items: Array<TMondayItem>;
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
  record_id: {
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

const GetRecord = QoreAppCreator.createLocalizedAction({
  action: 'get_record',
  app: MONDAY_APP_NAME,
  action_code: EQoreAppActionCode.ACTION,

  api_function: async (data, _opts, context) => {
    const token = context?.conn_opts?.token;
    const recordId = data?.record_id;

    if (!recordId || !token) {
      throw new Error('record_id, token are required to get a Monday app record.');
    }

    const query = `
    query GetItem($recordId: [ID!]!) {
      items(ids: $recordId) {
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
  `;

    const result = await callMondayAPI<TGetRecordResponseType>({
      query,
      token,
      variables: { recordId },
    });

    const items = result?.data?.items || [];

    const formattedItems = formatMondayRecordResponse(items);

    if (!formattedItems || formattedItems.length === 0) {
      throw new Error('The requested record was not found.');
    }

    return formattedItems[0];
  },
  options,
  response_type,
});

export default GetRecord;
