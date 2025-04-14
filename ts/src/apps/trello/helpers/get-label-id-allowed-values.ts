import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getTrelloAllowedValues, TrelloError } from './constants';

type TTrelloLabel = {
  id: string;
  name: string;
  color: string;
};

const mapTrelloLabelToAllowedValue = (item: TTrelloLabel) => ({
  display_name: item.name || `${item.color} label`,
  value: item.id,
  desc: `ID: ${item.id}\n\nColor: ${item.color}`,
});

export const getTrelloBoardLabelsIdAllowedValues: TQoreGetAllowedValuesFunction<
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
        ` are required to get Trello board label id allowed values`
    );
  }

  const path = `/boards/${id}/labels`;

  return await getTrelloAllowedValues<TTrelloLabel, string>({
    token: token!,
    key: key!,
    path,
    mapItemToAllowedValue: mapTrelloLabelToAllowedValue,
  });
};
