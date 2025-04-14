import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getTrelloAllowedValues, TrelloError } from './constants';

type TTrelloChecklistItem = {
  id: string;
  name: string;
  state: string;
  pos: number;
};

const mapTrelloChecklistItemToAllowedValue = (item: TTrelloChecklistItem) => ({
  display_name: item.name,
  value: item.id,
  desc: `ID: ${item.id}\n\nState: ${item.state}\n\nPosition: ${item.pos}`,
});

export const getTrelloChecklistItemsIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;
  const key = context?.conn_opts?.key;
  const id = context?.opts?.idChecklist || context?.opts?.checklistId || context?.opts?.id;

  const missingValues: string[] = [];

  if (!token) missingValues.push('token');
  if (!key) missingValues.push('key');
  if (!id) missingValues.push('checklist id');

  if (missingValues.length) {
    throw new TrelloError(
      `All of the following ${missingValues.join(', ')}` +
        ` are required to get Trello checklist item id allowed values`
    );
  }

  const path = `/checklists/${id}/checkItems`;

  return await getTrelloAllowedValues<TTrelloChecklistItem, string>({
    token: token!,
    key: key!,
    path,
    mapItemToAllowedValue: mapTrelloChecklistItemToAllowedValue,
  });
};
