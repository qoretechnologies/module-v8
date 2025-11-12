import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ZOHO_CRM_APP_NAME, ZohoCrmError } from '../constants';
import { zohoCrmApiClient } from '../helpers/constants';
import { extractZohoCrmErrorMessage } from '../helpers/extract-error';
import { getZohoCRMModuleApiNameAllowedValues } from '../helpers/get-module-allowed-values';
import { getZohoCrmRecordIdAllowedValues } from '../helpers/get-record-id-allowed-values';

const action = 'delete_record';

const options = {
  module: {
    type: 'string',
    required: true,
    get_allowed_values: getZohoCRMModuleApiNameAllowedValues,
    on_change: ['refetch'],
  },
  record_id: {
    type: 'string',
    required: true,
    depends_on: ['module'],
    get_allowed_values: getZohoCrmRecordIdAllowedValues,
  },
} satisfies TQoreOptions;

const DeleteRecord = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ZOHO_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, module, url, record_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['url', 'token'],
      optionFields: ['module', 'record_id'],
      ErrorClass: ZohoCrmError,
    });

    try {
      await zohoCrmApiClient({
        path: `${module}/${record_id}`,
        method: 'DELETE',
        token,
        url,
      });
    } catch (error) {
      if (error instanceof ZohoCrmError) {
        throw error;
      }

      throw new ZohoCrmError(
        `Failed to ${humanizeNameTitle(action)}: ${extractZohoCrmErrorMessage(error)}`
      );
    }
  },
});

export default DeleteRecord;
