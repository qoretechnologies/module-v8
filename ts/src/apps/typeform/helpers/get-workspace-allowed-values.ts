import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { createClient, Typeform } from '@typeform/api-client';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { TypeformError } from '../constants';

type Workspace = Typeform.API.Workspaces.List['items'][number];

const mapTypeformItemToAllowedValue = (item: Workspace): IQoreAllowedValue<string> => ({
  value: item.id!,
  display_name: item.name,
  desc: `Id: ${item.id}\n` + `Forms Count: ${item.forms?.count}\n`,
});

export const getTypeformWorkspaceIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: TypeformError,
  });

  const client = createClient({ token });

  const allWorkspaces: Workspace[] = [];
  let page = 1;
  let totalPages = 1;

  try {
    while (page <= totalPages) {
      const response = await client.workspaces.list({ page });
      allWorkspaces.push(...response.items);
      totalPages = response.page_count;
      page++;
    }
  } catch (error) {
    console.error(`Failed to fetch workspaces: ${error}`);
  }

  return allWorkspaces.map(mapTypeformItemToAllowedValue);
};
