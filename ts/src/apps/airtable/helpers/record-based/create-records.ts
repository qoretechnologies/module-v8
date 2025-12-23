import { TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import { AirtableError } from '../../constants';
import { airtableApiClient, parseTableIdentifier } from './constants';

type TAirtableRecord = {
  id: string;
  createdTime: string;
  fields: Record<string, any>;
};

type TAirtableCreateRecordsResponse = {
  records: TAirtableRecord[];
};

const AIRTABLE_BATCH_SIZE = 10;

export const createAirtableRecords: TQoreCreateRecordsFunction = async (
  context,
  records,
  options
) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: AirtableError,
  });

  const table = options?.table;
  const baseId = (options?.baseId || options?.base_id) as string | undefined;

  if (!table) {
    throw new AirtableError('Table name is required to create records.');
  }

  try {
    const { baseId: resolvedBaseId, tableId } = await parseTableIdentifier({
      token,
      tableName: table,
      baseId,
    });

    const recordObjects = mapColumnFormatToObject(records);

    const recordsToCreate = recordObjects.map((record) => {
      const { id, createdTime, ...fields } = record;
      return { fields };
    });

    const allCreatedRecords: TAirtableRecord[] = [];

    for (let i = 0; i < recordsToCreate.length; i += AIRTABLE_BATCH_SIZE) {
      const batch = recordsToCreate.slice(i, i + AIRTABLE_BATCH_SIZE);

      const response = await airtableApiClient<TAirtableCreateRecordsResponse>({
        token,
        path: `/v0/${resolvedBaseId}/${tableId}`,
        method: 'POST',
        body: {
          records: batch,
          typecast: true,
        },
      });

      allCreatedRecords.push(...response.records);
    }

    const flattenedRecords = allCreatedRecords.map((record) => ({
      id: record.id,
      createdTime: record.createdTime,
      ...record.fields,
    }));

    return mapObjectToColumnFormat(flattenedRecords);
  } catch (error) {
    if (error instanceof AirtableError) {
      throw error;
    }

    throw new AirtableError(`Failed to create records: ${error}`);
  }
};
