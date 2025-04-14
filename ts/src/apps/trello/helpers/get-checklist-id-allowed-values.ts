import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getTrelloAllowedValues, TrelloError } from './constants';

type TTrelloChecklist = {
  id: string;
  name: string;
  pos: number;
};

const mapTrelloChecklistToAllowedValue = (item: TTrelloChecklist) => ({
  display_name: item.name,
  value: item.id,
  desc: `ID: ${item.id}\n\nPosition: ${item.pos}`,
});

export const getTrelloCardChecklistsIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;
  const key = context?.conn_opts?.key;
  const id = context?.opts?.idCard || context?.opts?.cardId || context?.opts?.id;

  const missingValues: string[] = [];

  if (!token) missingValues.push('token');
  if (!key) missingValues.push('key');
  if (!id) missingValues.push('card id');

  if (missingValues.length) {
    throw new TrelloError(
      `All of the following ${missingValues.join(', ')}` +
        ` are required to get Trello card checklist id allowed values`
    );
  }

  const path = `/cards/${id}/checklists`;

  return await getTrelloAllowedValues<TTrelloChecklist, string>({
    token: token!,
    key: key!,
    path,
    mapItemToAllowedValue: mapTrelloChecklistToAllowedValue,
  });
};
