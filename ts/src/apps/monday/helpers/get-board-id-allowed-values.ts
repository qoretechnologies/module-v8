import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { MONDAY_BOARD_PAGE_SIZE } from '../constants';
import { fetchAllMondayPages } from './constants';

type TMondayBoard = {
  id: string;
  name: string;
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

  if (!token) {
    throw new Error('token is required to get Monday board ID allowed values');
  }

  // `boards` returns only the first 25 rows when `limit` is omitted, so the picker has to page.
  const boards = await fetchAllMondayPages<TMondayBoard>({
    token,
    collection: 'boards',
    pageSize: MONDAY_BOARD_PAGE_SIZE,
    buildQuery: (limit, page) => `
      query {
        boards(limit: ${limit}, page: ${page}) {
          id
          name
        }
      }
    `,
  });

  return boards.map(mapMondayBoard);
};
