import { TQoreGetRecordTypeFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { AttioError } from '../../constants';
import { getAttioAttributesAsQoreOptions } from '../get-object-properties';

export const getAttioRecordType: TQoreGetRecordTypeFunction = async (context, tableName) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: AttioError,
  });

  if (!tableName) {
    throw new AttioError('Table name is required to get record type');
  }

  try {
    const table = tableName.includes(' [') ? tableName.split(' [')[0] : tableName;
    const target = tableName.includes(' [') ? 'lists' : 'objects';

    const options = await getAttioAttributesAsQoreOptions(target, table, token);

    return {
      type: 'hash',
      fields: options,
    };
  } catch (error) {
    if (error instanceof AttioError) {
      throw error;
    }

    throw new AttioError(
      `Failed to fetch Attio record type for table ${tableName}: ${error?.message || error}`
    );
  }
};
