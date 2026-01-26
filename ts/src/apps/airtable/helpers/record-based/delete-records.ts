import { TQoreDeleteRecordsFunction } from '@qoretechnologies/ts-toolkit';
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

// Airtable allows up to 10 records per batch delete request
const AIRTABLE_BATCH_SIZE = 10;

export const deleteAirtableRecords: TQoreDeleteRecordsFunction = async (context, where, opts) => {
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

    const recordsToDelete = await fetchAirtablePaginatedRecords<
      TAirtableListRecordsResponse,
      TAirtableRecord
    >({
      token,
      path: `/v0/${resolvedBaseId}/${tableId}`,
      params,
      object: 'records',
    });

    if (!recordsToDelete || recordsToDelete.length === 0) {
      return 0;
    }

    const recordIds = recordsToDelete.map((record) => record.id);

    for (let i = 0; i < recordIds.length; i += AIRTABLE_BATCH_SIZE) {
      const batch = recordIds.slice(i, i + AIRTABLE_BATCH_SIZE);

      const deleteParams: Record<string, string[]> = {
        records: batch,
      };

      await airtableApiClient({
        token,
        path: `/v0/${resolvedBaseId}/${tableId}`,
        method: 'DELETE',
        params: deleteParams as unknown as Record<string, string>,
      });
    }

    return recordsToDelete.length;
  } catch (error) {
    if (error instanceof AirtableError) {
      throw error;
    }
    throw new AirtableError(`Failed to delete records in table ${tableName}: ${error}`);
  }
};
