import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { AirtableError } from '../../constants';
import { buildAirtableFilterFormula } from './apply-where-condition';
import {
  airtableApiClient,
  fetchAirtablePaginatedRecords,
  parseTableIdentifier,
} from './constants';

type TAirtableRecord = {
  id: string;
  createdTime: string;
  fields: Record<string, any>;
};

type TAirtableListRecordsResponse = {
  records: TAirtableRecord[];
  offset?: string;
};

// Airtable allows up to 10 records per batch update request
const AIRTABLE_BATCH_SIZE = 10;

export const updateAirtableRecords: TQoreUpdateRecordsFunction = async (
  context,
  fields,
  where,
  opts
) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: AirtableError,
  });

  const tableName = opts?.table;

  if (!tableName) {
    throw new AirtableError('Table name is required');
  }

  try {
    const { baseId: resolvedBaseId, tableId } = await parseTableIdentifier({
      token,
      tableName,
    });

    const params: Record<string, string> = {};
    if (where) {
      const filterByFormula = buildAirtableFilterFormula(where);
      if (filterByFormula) {
        params.filterByFormula = filterByFormula;
      }
    }

    const recordsToUpdate = await fetchAirtablePaginatedRecords<
      TAirtableListRecordsResponse,
      TAirtableRecord
    >({
      token,
      path: `/v0/${resolvedBaseId}/${tableId}`,
      params,
      object: 'records',
    });

    if (!recordsToUpdate || recordsToUpdate.length === 0) {
      return 0;
    }

    const { id: _id, createdTime: _createdTime, ...updateFields } = fields as Record<string, any>;

    const updateBatches: Array<{ id: string; fields: Record<string, any> }[]> = [];

    for (let i = 0; i < recordsToUpdate.length; i += AIRTABLE_BATCH_SIZE) {
      const batch = recordsToUpdate.slice(i, i + AIRTABLE_BATCH_SIZE).map((record) => ({
        id: record.id,
        fields: updateFields,
      }));
      updateBatches.push(batch);
    }

    for (const batch of updateBatches) {
      await airtableApiClient({
        token,
        path: `/v0/${resolvedBaseId}/${tableId}`,
        method: 'PATCH',
        body: {
          records: batch,
          typecast: true,
        },
      });
    }

    return recordsToUpdate.length;
  } catch (error) {
    if (error instanceof AirtableError) {
      throw error;
    }
    throw new AirtableError(`Failed to update records in table ${tableName}: ${error}`);
  }
};
