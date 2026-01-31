import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getTrelloAllowedValues, TrelloError } from './constants';

type TTrelloBoard = {
  id: string;
  name: string;
  desc: string;
};

const mapTrelloBoardToAllowedValue = (item: TTrelloBoard) => ({
  display_name: item.name,
  value: item.id,
  desc: `ID: ${item.id}\n\nDescription: ${item.desc}`,
});

export const getTrelloBoardIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;
  const key = context?.conn_opts?.key;

  const missingValues: string[] = [];

  if (!token) missingValues.push('token');
  if (!key) missingValues.push('key');

  if (missingValues.length) {
    throw new TrelloError(
      `All of the following ${missingValues.join(', ')} are required to get Trello board id allowed values`
    );
  }

  const path = '/members/me/boards';

  return await getTrelloAllowedValues<TTrelloBoard, string>({
    token: token!,
    key: key!,
    path,
    mapItemToAllowedValue: mapTrelloBoardToAllowedValue,
  });
};
