import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { AirtableError } from '../../constants';
import { fetchAirtablePaginatedRecords, getAirtableTablesMap } from './constants';

type TBase = {
  id: string;
  name: string;
  permissionLevel: string;
};

export const getAirtableTableList: TQoreGetTableListFunction = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: AirtableError,
  });

  try {
    const bases = await fetchAirtablePaginatedRecords<{ bases: TBase[]; offset?: string }, TBase>({
      token,
      path: '/v0/meta/bases',
      object: 'bases',
    });

    const tableNames: string[] = [];

    for (const base of bases) {
      try {
        const tablesMap = await getAirtableTablesMap({ token, baseId: base.id });
        for (const tableName of Object.keys(tablesMap)) {
          tableNames.push(`${base.name}/${tableName}`);
        }
      } catch (error) {
        continue;
      }
    }

    return tableNames;
  } catch (error) {
    if (error instanceof AirtableError) {
      throw error;
    }

    throw new AirtableError(`Failed to get table list: ${error}`);
  }
};
