import { PageObjectResponse } from '@notionhq/client';
import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { Debugger } from '../../../../utils/Debugger';
import { NotionError } from '../../constants';
import { createNotionClient, getNotionDataSourceByTitle } from '../constants';
import { buildNotionFilter } from './apply-where-condition';
import { formatNotionRowProperties } from './create-records';

export const updateNotionRecords: TQoreUpdateRecordsFunction = async (
  context,
  fields,
  where,
  opts
) => {
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
    const notion = createNotionClient(token);

    const filter = where ? buildNotionFilter(where, dataSource.properties) : undefined;

    const queryParams: any = {
      data_source_id: dataSource.id,
    };

    if (filter) {
      queryParams.filter = filter;
    }

    const response = await notion.dataSources.query(queryParams);

    if (!response.results.length) {
      return 0;
    }

    const formattedFields = formatNotionRowProperties({
      properties: dataSource.properties,
      rowData: fields,
    });

    const batchSize = 3;
    let updatedCount = 0;

    for (let i = 0; i < response.results.length; i += batchSize) {
      const batch = response.results.slice(i, i + batchSize);

      const batchPromises = batch.map(async (page) => {
        try {
          await notion.pages.update({
            page_id: (page as PageObjectResponse).id,
            properties: formattedFields,
          });
          return true;
        } catch (error) {
          Debugger.log(
            `Error updating page ${(page as PageObjectResponse).id}:`,
            error instanceof Error ? error.message : error
          );
          return false;
        }
      });

      const results = await Promise.all(batchPromises);
      updatedCount += results.filter(Boolean).length;

      if (i + batchSize < response.results.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return updatedCount;
  } catch (error) {
    if (error instanceof NotionError) {
      throw error;
    }
    throw new NotionError(
      `Failed to update records in table ${tableName}: ${error.message || error}`
    );
  }
};
