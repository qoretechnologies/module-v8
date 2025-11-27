import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { callMondayAPI } from './constants';

type TBoardColumn = {
  id: string;
  title: string;
  settings_str?: string;
};

type TBoardColumnsResponseType = {
  data: {
    boards: {
      columns: TBoardColumn[];
    }[];
  };
};

export const getMondaySingleColumnAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const board_id = context?.opts?.board_id;
  const column_id = context?.opts?.column_id;

  if (!token) {
    throw new Error('token is required to get Monday column allowed values');
  }
  if (!board_id) {
    throw new Error('Board ID is required to fetch columns');
  }
  if (!column_id) {
    throw new Error('Column ID is required to fetch a single column');
  }

  const query = `
    query GetBoardColumn($boardId: [ID!]!, $columnId: [String!]) {
      boards(ids: $boardId) {
        columns(ids: $columnId) {
          id
          title
          settings_str
        }
      }
    }
  `;

  const response = await callMondayAPI<TBoardColumnsResponseType>({
    query,
    token,
    variables: {
      boardId: board_id,
      columnId: [column_id],
    },
  });

  const columns = response.data?.boards?.[0]?.columns;
  if (!columns || columns.length === 0) {
    throw new Error('No column returned from monday.com API');
  }

  if (!columns[0].settings_str) {
    return [];
  }

  const settings = JSON.parse(columns[0]?.settings_str);

  if (!settings.labels) {
    return [];
  }

  return Object.keys(settings.labels).map(
    (key: string): IQoreAllowedValue<string> => ({
      value: key,
      display_name: settings.labels[key],
      short_desc: `Value: ${key}\n\nLabel: ${settings.labels[key]}`,
    })
  );
};
