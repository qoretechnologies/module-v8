import { TQoreGetRecordTypeFunction, TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { ZohoCrmError } from '../../constants';
import { getZohoCrmModuleFieldsOptions } from '../get-module-fields';

export const getZohoCrmRecordType: TQoreGetRecordTypeFunction = async (context, tableName) => {
  getQoreContextRequiredValues({
    context,
    connectionFields: ['url', 'token'],
    ErrorClass: ZohoCrmError,
  });

  return (await getZohoCrmModuleFieldsOptions({
    ...context,
    opts: {
      module: tableName,
    },
  })) as TQoreTypeObject;
};
