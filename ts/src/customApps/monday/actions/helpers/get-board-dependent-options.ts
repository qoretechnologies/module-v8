import {
  IQoreAllowedValue,
  IQoreTypeObjectNonList,
  TQoreAppActionOption,
  TQoreGetDependentOptionsFunction,
} from '@qoretechnologies/ts-toolkit';
import { callMondayAPI } from '../constants';

type TBoardColumn = {
  id: string;
  title: string;
  settings_str: string;
};

type TBoardColumnsResponseType = {
  data: {
    boards: {
      columns: TBoardColumn[];
    }[];
  };
};

const mapMondayColumnToQoreOption = (column: TBoardColumn): TQoreAppActionOption => {
  const settings = JSON.parse(column.settings_str);

  const allowedValues = settings?.labels
    ? Object.keys(settings.labels).map(
        (key: string): IQoreAllowedValue<string> => ({
          value: key,
          display_name: settings.labels[key],
          short_desc: `Value: ${key}\n\nLabel: ${settings.labels[key]}`,
        })
      )
    : null;

  return {
    type: 'any',
    display_name: column.title,
    desc: column.title,
    short_desc: column.title,
    ...(allowedValues ? { allowed_values: allowedValues } : {}),
    required: false,
  };
};

export const getMondayBoardDependentOptions: TQoreGetDependentOptionsFunction = async (
  context
): Promise<Record<string, TQoreAppActionOption>> => {
  const token = context?.conn_opts?.token;
  const url = context?.conn_opts?.url;
  const board_id = context?.opts?.board_id;

  if (!token || !url) {
    throw new Error('Both token and API url are required to get Monday record fields');
  }

  const query = `
    query GetBoardColumns($boardId: [ID!]!) {
      boards(ids: $boardId) {
        columns {
          id
          title
          settings_str
        }
      }
    }
  `;

  const response = await callMondayAPI<TBoardColumnsResponseType>({
    query,
    token,
    url,
    variables: {
      boardId: board_id,
    },
  });

  const columns = response.data?.boards?.[0]?.columns;
  if (!columns) {
    throw new Error('No columns returned from monday.com API');
  }

  const columnValuesFields: IQoreTypeObjectNonList['fields'] = {};
  columns.forEach((column) => {
    columnValuesFields[column.id] = mapMondayColumnToQoreOption(column);
  });

  const recordFields = {
    column_values: {
      required: false,
      display_name: 'Column Values',
      short_desc: 'The values to set for the record columns.',
      desc: 'The values to set for the columns of the record you want to create.',

      type: {
        type: 'hash',
        fields: columnValuesFields,
      },
    },
  } satisfies Record<string, TQoreAppActionOption>;

  return recordFields;
};
