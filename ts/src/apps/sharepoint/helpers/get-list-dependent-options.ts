import { Client, PageCollection } from '@microsoft/microsoft-graph-client';
import { ColumnDefinition } from '@microsoft/microsoft-graph-types';
import {
  IQoreTypeObjectNonList,
  TQoreAppActionOption,
  TQoreGetDependentOptionsFunction,
} from '@qoretechnologies/ts-toolkit';

export const getSharepointListDependentOptions: TQoreGetDependentOptionsFunction = async (
  context
): Promise<Record<string, TQoreAppActionOption>> => {
  const token = context?.conn_opts?.token;
  const listId = context?.opts?.list_id;
  const siteId = context?.opts?.site_id;

  const missingValues: string[] = [];

  if (!token) missingValues.push('token');
  if (!listId) missingValues.push('listId');
  if (!siteId) missingValues.push('siteId');

  if (missingValues.length) {
    throw new Error(
      `All of the following ${missingValues.join(', ')} are required to get SharePoint list dependent options`
    );
  }

  const columnValuesFields: IQoreTypeObjectNonList['fields'] = {};

  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token!),
    },
  });

  let response: PageCollection = await client.api(`/sites/${siteId}/lists/${listId}/columns`).get();

  const columns: ColumnDefinition[] = [];

  while (response.value.length > 0) {
    for (const column of response.value as ColumnDefinition[]) {
      if (!column.readOnly) {
        columns.push(column);
      }
    }
    if (response['@odata.nextLink']) {
      response = await client.api(response['@odata.nextLink']).get();
    } else {
      break;
    }
  }
  for (const column of columns) {
    const params = {
      display_name: column.displayName!,
      short_desc: column.description ?? '',
      required: false,
    } satisfies Partial<TQoreAppActionOption>;
    if (column.boolean) {
      columnValuesFields[column.name!] = { ...params, type: 'boolean' };
    } else if (column.text) {
      columnValuesFields[column.name!] = { ...params, type: 'string' };
    } else if (column.dateTime) {
      columnValuesFields[column.name!] = { ...params, type: 'date' };
    } else if (column.choice) {
      if (column.choice.displayAs === 'checkBoxes') {
        columnValuesFields[column.name!] = {
          ...params,
          type: {
            type: 'list',
            element_type: 'any',
          },
          allowed_values: column.choice?.choices
            ? column.choice.choices.map((choice: string) => ({
                display_name: choice,
                value: choice,
              }))
            : [],
        };
      } else {
        columnValuesFields[column.name!] = {
          ...params,
          type: 'softstring',
          allowed_values: column.choice?.choices
            ? column.choice.choices.map((choice: string) => ({
                display_name: choice,
                value: choice,
              }))
            : [],
        };
      }
    } else if (column.number) {
      columnValuesFields[column.name!] = { ...params, type: 'number' };
    } else if (column.currency) {
      columnValuesFields[column.name!] = { ...params, type: 'number' };
    }
  }

  const listColumns = {
    list_columns: {
      required: true,
      display_name: 'Column Values',
      short_desc: 'The values to set for the item properties.',
      desc: 'The values to set for the item properties.',

      type: {
        type: 'hash',
        fields: columnValuesFields,
      },
    },
  } satisfies Record<string, TQoreAppActionOption>;

  return listColumns;
};
