import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getTrelloAllowedValues, TrelloError } from './constants';

type TTrelloList = {
  id: string;
  name: string;
  closed: boolean;
};

const mapTrelloListToAllowedValue = (item: TTrelloList) => ({
  display_name: item.name,
  value: item.id,
  desc: `ID: ${item.id}\n\nStatus: ${item.closed ? 'Archived' : 'Active'}`,
});

export const getTrelloBoardListsIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;
  const key = context?.conn_opts?.key;
  const id = context?.opts?.idBoard || context?.opts?.boardId || context?.opts?.id;

  const missingValues: string[] = [];

  if (!token) missingValues.push('token');
  if (!key) missingValues.push('key');
  if (!id) missingValues.push('board id');

  if (missingValues.length) {
    throw new TrelloError(
      `All of the following ${missingValues.join(', ')}` +
        ` are required to get Trello board list id allowed values`
    );
  }

  const path = `/boards/${id}/lists`;

  return await getTrelloAllowedValues<TTrelloList, string>({
    token: token!,
    key: key!,
    path,
    mapItemToAllowedValue: mapTrelloListToAllowedValue,
  });
};
