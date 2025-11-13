import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ZOHO_CRM_APP_NAME, ZohoCrmError } from '../constants';
import { zohoCrmApiClient } from '../helpers/constants';
import { extractZohoCrmErrorMessage } from '../helpers/extract-error';
import { getZohoCRMModuleApiNameAllowedValues } from '../helpers/get-module-allowed-values';
import { getZohoCrmModuleFieldsResponseType } from '../helpers/get-module-fields';
import { getZohoCrmRecordIdAllowedValues } from '../helpers/get-record-id-allowed-values';

const action = 'get_record';

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

const GetRecord = QoreAppCreator.createLocalizedAction<typeof options>({
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
      const response = await zohoCrmApiClient<{ data: Array<Record<string, any>> }>({
        path: `${module}/${record_id}`,
        method: 'GET',
        token,
        url,
      });

      const record = response.data[0];

      return record;
    } catch (error) {
      if (error instanceof ZohoCrmError) {
        throw error;
      }

      throw new ZohoCrmError(
        `Failed to ${humanizeNameTitle(action)}: ${extractZohoCrmErrorMessage(error)}`
      );
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      Modified_Time: { type: 'string' },
      Created_Time: { type: 'string' },
      id: { type: 'string' },
      Modified_By: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
      Created_By: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
  },
  get_dynamic_response_type: getZohoCrmModuleFieldsResponseType,
});

export default GetRecord;
