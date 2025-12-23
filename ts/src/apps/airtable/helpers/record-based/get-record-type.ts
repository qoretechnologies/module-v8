import { IQoreTypeObjectNonList, TQoreGetRecordTypeFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { AirtableError } from '../../constants';
import { mapTableFieldsToOptions } from '../get-record-type';
import { resolveTableWithMetadata } from './constants';

export const getAirtableRecordType: TQoreGetRecordTypeFunction = async (context, tableName) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: AirtableError,
  });

  try {
    const { table, baseId: resolvedBaseId } = await resolveTableWithMetadata({
      token,
      tableName,
    });

    const fields = mapTableFieldsToOptions({
      table,
      setPrimaryRequired: false,
      baseId: resolvedBaseId,
      token,
    });

    return {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        createdTime: { type: 'string' },
        ...fields,
      },
    } as IQoreTypeObjectNonList;
  } catch (error) {
    if (error instanceof AirtableError) {
      throw error;
    }
    throw new AirtableError(`Failed to get record type for table "${tableName}": ${error}`);
  }
};
