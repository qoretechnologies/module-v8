import { MondayError } from '../constants';
import { Debugger } from '../../../utils/Debugger';
import { callMondayAPI } from './client';
import { getMondayBoardFields } from './get-board-fields';

export { callMondayAPI, type TMondayApiDynamicOptions } from './client';

type TBatchCreateItem = {
  board_id: string;
  group_id?: string;
  item_name: string;
  column_values?: Record<string, any>;
};

type TRecordResponse = {
  id: string;
  name?: string;
  created_at: string;
  updated_at: string;
  column_values?: {
    id: string;
    text: string;
    value: string;
    type: string;
    column: {
      title: string;
      settings?: {
        labels?: {
          id: string;
          label: string;
        }[];
      };
    };
  }[];
};

type TBatchCreateResponse = {
  data: {
    [key: string]: TRecordResponse | null;
  };
  errors:
    | {
        message: string;
        path: string[];
        extensions: {
          error_data: { column_id: string; column_name: string };
        };
      }[]
    | null;
};

export const batchCreateMondayItems = async (
  items: TBatchCreateItem[],
  token: string,
  groupId?: string
): Promise<TRecordResponse[]> => {
  const BATCH_SIZE = 20;
  const results: TRecordResponse[] = [];

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);

    const mutationParts: string[] = [];
    const variableDefinitions: string[] = [];
    const variables: Record<string, any> = {};

    batch.forEach((item, index) => {
      const alias = `createItem${i + index}`;
      const boardVar = `$boardId${i + index}`;
      const groupVar = `$groupId${i + index}`;
      const nameVar = `$itemName${i + index}`;
      const columnValuesVar = `$columnValues${i + index}`;

      variableDefinitions.push(`${boardVar}: ID!`);
      variableDefinitions.push(`${nameVar}: String!`);

      variables[`boardId${i + index}`] = item.board_id;
      variables[`itemName${i + index}`] = item.item_name;

      const params = [`board_id: ${boardVar}`, `item_name: ${nameVar}`];

      if (groupId) {
        variableDefinitions.push(`${groupVar}: String`);
        variables[`groupId${i + index}`] = groupId;
        params.push(`group_id: ${groupVar}`);
      }

      if (item.column_values) {
        variableDefinitions.push(`${columnValuesVar}: JSON`);
        variables[`columnValues${i + index}`] = JSON.stringify(item.column_values);
        params.push(`column_values: ${columnValuesVar}`);
      }

      const mutationPart = `
        ${alias}: create_item(
          ${params.join(', ')}
        ) {
          id
          name
          column_values {
            id
            text
            value
            type
            column {
                title
                settings
            }
          }
          created_at
          updated_at
        }
      `;

      mutationParts.push(mutationPart);
    });

    const query = `
      mutation CreateItems(${variableDefinitions.join(', ')}) {
        ${mutationParts.join('\n')}
      }
    `;

    const batchResult = await callMondayAPI<TBatchCreateResponse>({
      query,
      variables,
      token,
    });

    const errorMessages: string[] = [];

    if (batchResult.errors) {
      errorMessages.push(
        ...batchResult.errors.map((err) => {
          const columnValue =
            err?.path[0] && err?.extensions?.error_data
              ? `Record: ${err.path[0]} (Column: ${err.extensions.error_data.column_name} - ${err.extensions.error_data.column_id})`
              : '';
          return `${err.message} ${columnValue}`;
        })
      );

      Debugger.log(`Errors were returned during batch creation. ${errorMessages.join('; ')}`);
    }

    const records = Object.values(batchResult.data).filter((item) => item !== null);

    if (!records.length) {
      throw new MondayError(
        `No items were created in the batch operation. ${errorMessages.join('; ')}`
      );
    }

    results.push(...records);
  }

  return results;
};

export const formatMondayRecords = async (options: {
  records: Record<string, any>[];
  token: string;
  boardId: string;
}): Promise<Record<string, any>[]> => {
  const { records, token, boardId } = options;

  const columns = await getMondayBoardFields(token, boardId);

  const formatRecord = (record: Record<string, any>): Record<string, any> => {
    const formattedRecord: Record<string, any> = {};

    Object.keys(record).forEach((key) => {
      const column = columns[key];

      if (!column) {
        return;
      }

      if (column.type === 'people' && record[key]?.length > 0) {
        formattedRecord[key] = {
          personsAndTeams: record[key],
        };
      } else if (column.type === 'dropdown') {
        formattedRecord[key] = {
          labels: record[key],
        };
      } else if (column.type === 'checkbox') {
        formattedRecord[key] = {
          checked: Boolean(record[key]),
        };
      } else {
        formattedRecord[key] = record[key];
      }
    });

    return formattedRecord;
  };

  return records.map((record) => formatRecord(record));
};

export const formatMondayRecordResponse = (
  records: TRecordResponse[]
): Array<Record<string, any>> => {
  return records.map((record) => {
    const columns: Record<string, any> = {};
    record.column_values?.forEach((column) => {
      let value: any = column.value;
      try {
        value = JSON.parse(column.value);
      } catch {
        // keep original value if parsing fails
      }

      if (column.type === 'people' && value?.personsAndTeams) {
        value = value.personsAndTeams;
      } else if (column.type === 'checkbox' && value?.checked !== undefined) {
        value = value.checked;
      } else if (column.type === 'status' && column.text !== null) {
        value = column.text;
      } else if (column.type === 'date' && value?.date) {
        value = value.date;
      } else if (column.type === 'dropdown' && value?.ids?.length && column.text) {
        value = column.text.split(', ');
      }

      columns[column.id] = value;
    });

    return {
      id: record.id,
      name: record.name,
      created_at: record.created_at,
      updated_at: record.updated_at,
      ...columns,
    };
  });
};
