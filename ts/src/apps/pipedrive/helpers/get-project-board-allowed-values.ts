import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchPipedriveAllowedValues } from './client';

type TPipedriveProjectBoardData = {
  id: string;
  name: string;
};

const mapPipedriveProjectBoard = (
  board: TPipedriveProjectBoardData
): IQoreAllowedValue<string> => ({
  display_name: board.name,
  value: board.id,
});

export const getPipedriveProjectBoardIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Pipedrive project/board allowed values');
  }

  const projectBoards = await fetchPipedriveAllowedValues<TPipedriveProjectBoardData>({
    token,
    mapItemToAllowedValue: mapPipedriveProjectBoard,
    path: 'v1/projects/boards',
  });

  return projectBoards;
};
