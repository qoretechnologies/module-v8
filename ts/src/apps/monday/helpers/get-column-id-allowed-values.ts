import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { callMondayAPI } from './constants';

type TBoardColumn = {
  id: string;
  title: string;
};

type TBoardColumnsResponseType = {
  data: {
    boards: {
      columns: TBoardColumn[];
    }[];
  };
};

const mapMondayColumn = (column: TBoardColumn): IQoreAllowedValue<string> => ({
  value: column.id,
  display_name: column.title,
  short_desc: `Column ID: ${column.id}\nTitle: ${column.title}`,
});

export const getMondayColumnIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const board_id = context?.opts?.board_id;

  if (!token) {
    throw new Error('token is required to get Monday column ID allowed values');
  }

  const query = `
    query GetBoardColumns($boardId: [ID!]!) {
      boards(ids: $boardId) {
        columns {
          id
          title
        }
      }
    }
  `;

  const response = await callMondayAPI<TBoardColumnsResponseType>({
    query,
    token,
    variables: {
      boardId: board_id,
    },
  });

  const columns = response.data?.boards?.[0]?.columns;
  if (!columns) {
    throw new Error('No columns returned from monday.com API');
  }

  return columns.map(mapMondayColumn);
};
