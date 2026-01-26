import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ZOHO_CRM_APP_NAME, ZohoCrmError } from '../constants';
import { zohoCrmApiClient } from '../helpers/constants';
import { extractZohoCrmErrorMessage } from '../helpers/extract-error';
import { getZohoCRMModuleApiNameAllowedValues } from '../helpers/get-module-allowed-values';
import { getZohoCrmModuleFieldsOptions } from '../helpers/get-module-fields';
import { getZohoCrmRecordIdAllowedValues } from '../helpers/get-record-id-allowed-values';

const action = 'update_record';

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
  properties: {
    required: true,
    depends_on: ['module'],
    type: {
      type: 'hash',
    },
    get_dynamic_type: getZohoCrmModuleFieldsOptions,
  },
} satisfies TQoreOptions;

type TUpdateRecordResponse = {
  data: Array<{
    code: string;
    details: {
      id: string;
    };
    message: string;
    status: string;
  }>;
};

const isSuccess = (status: string): boolean => status.toLowerCase() === 'success';

const UpdateRecord = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ZOHO_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, module, properties, url, record_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['url', 'token'],
      optionFields: ['module', 'record_id', 'properties'],
      ErrorClass: ZohoCrmError,
    });

    try {
      const response = await zohoCrmApiClient<TUpdateRecordResponse>({
        path: `${module}/${record_id}`,
        method: 'PUT',
        token,
        url,
        body: { data: [properties] },
      });

      const recordData = response.data[0];

      if (!isSuccess(recordData.status)) {
        throw new ZohoCrmError(
          `Failed to update record in module ${module}: ${recordData.message} (code: ${recordData.code})`
        );
      }

      return recordData.details;
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
});

export default UpdateRecord;
