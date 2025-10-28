import { PageObjectResponse } from '@notionhq/client';
import { TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { NotionError } from '../../constants';
import {
  createNotionClient,
  getNotionDataSourceByTitle,
  mapNotionPropertiesToSimpleObject,
  NotionFieldMapping,
} from '../constants';

export const createNotionRecords: TQoreCreateRecordsFunction = async (context, records, opts) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: NotionError,
  });

  const tableName = opts?.table;

  if (!tableName) {
    throw new NotionError('Table name is required');
  }

  try {
    const dataSource = await getNotionDataSourceByTitle({ token, titleQuery: tableName });
    const recordsArray = mapColumnFormatToObject<Record<string, any>>(records);
    const formattedRecords = recordsArray.map((row) =>
      formatNotionRowProperties({
        properties: dataSource.properties,
        rowData: row,
      })
    );

    const results = await createDataSourceItemsInBatches(token, dataSource.id, formattedRecords);

    if (!results?.length) {
      throw new NotionError(`No record was created in table ${tableName}`);
    }

    const createdRows = results.filter((result, index) => {
      if (result.error) {
        Debugger.info(
          `Error creating record in table ${tableName}: ${result.error}\nData: ${JSON.stringify(formattedRecords[index])}`
        );

        return false;
      }

      return result.data;
    });

    if (!createdRows.length) {
      throw new NotionError(`No record was created in table ${tableName}`);
    }

    const createdRowsProperties = createdRows.map((row) =>
      mapNotionPropertiesToSimpleObject(
        {
          ...row.data!.properties,
          id: { type: 'id', id: row.data!.id },
          created_time: { type: 'date', date: { start: row.data!.created_time } },
          last_edited_time: { type: 'date', date: { start: row.data!.last_edited_time } },
        },
        'name'
      )
    );

    return mapObjectToColumnFormat(createdRowsProperties);
  } catch (error) {
    if (error instanceof NotionError) {
      throw error;
    }
    throw new NotionError(
      `Failed to create records in table ${tableName}: ${error.message || error}`
    );
  }
};

type CreatePageProperties = Record<string, any>;

interface BatchCreateResult {
  data: PageObjectResponse | null;
  error: string | null;
}

const createDataSourceItemsInBatches = async (
  token: string,
  dataSourceId: string,
  itemsData: CreatePageProperties[]
): Promise<BatchCreateResult[]> => {
  const notion = createNotionClient(token);
  const batchSize = 3;
  const results: BatchCreateResult[] = [];

  for (let i = 0; i < itemsData.length; i += batchSize) {
    const batch = itemsData.slice(i, i + batchSize);

    const batchPromises = batch.map(async (itemData): Promise<BatchCreateResult> => {
      try {
        const page = await notion.pages.create({
          parent: {
            type: 'data_source_id',
            data_source_id: dataSourceId,
          },
          properties: itemData,
        });

        return { data: page as PageObjectResponse, error: null };
      } catch (error) {
        return {
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    if (i + batchSize < itemsData.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
};

export const formatNotionRowProperties = (options: {
  properties: Record<string, any>;
  rowData: Record<string, any>;
}) => {
  const { properties, rowData } = options;
  const propertiesFormatted: Record<string, any> = {};

  Object.keys(rowData).forEach((key) => {
    if (rowData[key]) {
      const fieldType: string = properties[key].type;
      propertiesFormatted[key] = NotionFieldMapping[fieldType].buildNotionType(rowData[key]);
    }
  });
  return propertiesFormatted;
};
