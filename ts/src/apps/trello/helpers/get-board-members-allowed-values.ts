import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getTrelloAllowedValues, TrelloError } from './constants';

type TTrelloMember = {
  id: string;
  fullName: string;
  username: string;
};

const mapTrelloMemberToAllowedValue = (item: TTrelloMember) => ({
  display_name: item.fullName,
  value: item.id,
  desc: `ID: ${item.id}\n\nUsername: ${item.username}`,
});

export const getTrelloBoardMembersIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;
  const key = context?.conn_opts?.key;
  const id = context?.opts?.id;

  const missingValues: string[] = [];

  if (!token) missingValues.push('token');
  if (!key) missingValues.push('key');
  if (!id) missingValues.push('board id');

  if (missingValues.length) {
    throw new TrelloError(
      `All of the following ${missingValues.join(', ')}` +
        ` are required to get Trello board member id allowed values`
    );
  }

  const path = `/boards/${id}/members`;

  return await getTrelloAllowedValues<TTrelloMember, string>({
    token: token!,
    key: key!,
    path,
    mapItemToAllowedValue: mapTrelloMemberToAllowedValue,
  });
};
