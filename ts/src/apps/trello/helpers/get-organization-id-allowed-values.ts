import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getTrelloAllowedValues, TrelloError } from './constants';

type TTrelloOrganization = {
  id: string;
  displayName: string;
  domainName: string;
  membersCount: string;
};

const mapTrelloOrganizationToAllowedValue = (item: TTrelloOrganization) => ({
  display_name: item.displayName,
  value: item.id,
  desc: `ID: ${item.id}\n\nDomain Name: ${item.domainName}\n\nMembers Count: ${item.membersCount}`,
});

export const getTrelloOrganizationIdAllowedValues: TQoreGetAllowedValuesFunction<
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
      `All of the following ${missingValues.join(', ')} are required to get Trello organization id allowed values`
    );
  }

  const path = '/members/me/organizations';

  return await getTrelloAllowedValues<TTrelloOrganization, string>({
    token: token!,
    key: key!,
    path,
    mapItemToAllowedValue: mapTrelloOrganizationToAllowedValue,
  });
};
