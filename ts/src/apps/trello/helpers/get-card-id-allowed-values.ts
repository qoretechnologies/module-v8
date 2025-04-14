import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getTrelloAllowedValues, TrelloError } from './constants';

type TTrelloCard = {
  id: string;
  name: string;
  desc: string;
  closed: boolean;
};

const mapTrelloCardToAllowedValue = (item: TTrelloCard) => ({
  display_name: item.name,
  value: item.id,
  desc: `ID: ${item.id}\n\nDescription: ${item.desc}\n\nStatus: ${item.closed ? 'Archived' : 'Active'}`,
});

export const getTrelloListCardsIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;
  const key = context?.conn_opts?.key;
  const id = context?.opts?.idList || context?.opts?.listId || context?.opts?.id;

  const missingValues: string[] = [];

  if (!token) missingValues.push('token');
  if (!key) missingValues.push('key');
  if (!id) missingValues.push('list id');

  if (missingValues.length) {
    throw new TrelloError(
      `All of the following ${missingValues.join(', ')}` +
        ` are required to get Trello list card id allowed values`
    );
  }

  const path = `/lists/${id}/cards`;

  return await getTrelloAllowedValues<TTrelloCard, string>({
    token: token!,
    key: key!,
    path,
    mapItemToAllowedValue: mapTrelloCardToAllowedValue,
  });
};
