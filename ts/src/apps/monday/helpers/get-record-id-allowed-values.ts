import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { callMondayAPI } from './constants';

type TMondayRecord = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

type TRecordsResponseType = {
  data: {
    boards: {
      items_page: {
        cursor: string;
        items: TMondayRecord[];
      };
    }[];
  };
};

const mapMondayRecord = (record: TMondayRecord): IQoreAllowedValue<string> => ({
  value: record.id,
  display_name: record.name,
  short_desc:
    `ID: ${record.id}\n\nName: ${record.name}\n\n` +
    `Created At: ${record.created_at}\n\n` +
    `Updated At: ${record.updated_at}`,
});

export const getMondayRecordIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const board_id = context?.opts?.board_id;

  if (!token) {
    throw new Error('token is required to get Monday record ID allowed values');
  }

  const query = `
  query GetSortedBoardItems($boardId: [ID!]!) {
    boards(ids: $boardId) {
      items_page(query_params: {
        order_by: [
          { column_id: "__creation_log__", direction: desc },
          { column_id: "__last_updated__", direction: desc }
        ]
      }) {
        cursor
        items {
          id
          name
          created_at
          updated_at
        }
      }
    }
  }
`;

  const response = await callMondayAPI<TRecordsResponseType>({
    query,
    token,
    variables: {
      boardId: board_id,
    },
  });

  const records = response.data?.boards?.[0]?.items_page?.items;
  if (!records) {
    throw new Error('No records returned from monday.com API');
  }

  return records.map(mapMondayRecord);
};
