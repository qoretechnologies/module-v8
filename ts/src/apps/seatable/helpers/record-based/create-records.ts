import { TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapColumnFormatToObject, mapObjectToColumnFormat } from '../../../../global/helpers';
import { seatableClient, SeaTableAppendRowsResponse } from '../../client';
import { SeaTableError } from '../../constants';

export const createSeaTableRecords: TQoreCreateRecordsFunction = async (context, records, options) => {
  const { token, url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'url'],
    ErrorClass: SeaTableError,
  });

  const tableName = options?.table;

  if (!tableName) {
    throw new SeaTableError('Table name is required to create records.');
  }

  try {
    const items = mapColumnFormatToObject(records);

    // SeaTable append rows endpoint
    // Request format: { table_name: string, rows: [{ column: value }, ...] }
    const response = await seatableClient.basePost<SeaTableAppendRowsResponse>(
      'rows/',
      {
        table_name: tableName,
        rows: items,
      },
      { connectionOptions: { url, token } }
    );

    // Return created records with their IDs
    const createdRecords = (response?.row_ids || []).map((row, index) => ({
      _id: row._id,
      ...items[index],
    }));

    return mapObjectToColumnFormat(createdRecords);
  } catch (error) {
    if (error instanceof SeaTableError) {
      throw error;
    }

    throw new SeaTableError(`Failed to create records: ${error}`);
  }
};
