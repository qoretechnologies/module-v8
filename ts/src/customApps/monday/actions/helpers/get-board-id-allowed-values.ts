import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { callMondayAPI } from '../constants';

type TMondayBoard = {
  id: string;
  name: string;
};

type TBoardsResponseType = {
  data: {
    boards: TMondayBoard[];
  };
};

const mapMondayBoard = (board: TMondayBoard): IQoreAllowedValue<string> => ({
  value: board.id,
  display_name: board.name,
  short_desc: `ID: ${board.id}\n\nName: ${board.name}`,
});

export const getMondayBoardIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const url = context?.conn_opts?.url;

  if (!token || !url) {
    throw new Error('Both token and api url are required to get Monday board ID allowed values');
  }

  const query = `
    query {
      boards {
        id
        name
      }
    }
  `;

  const response = await callMondayAPI<TBoardsResponseType>({
    query,
    token,
    url,
  });

  const boards = response.data.boards;
  if (!boards) {
    throw new Error('No boards returned from monday.com API');
  }

  return boards.map(mapMondayBoard);
};
