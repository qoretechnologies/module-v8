import {
  EQoreAppActionCode,
  IQoreTypeObjectNonList,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { pick } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ZOHO_CRM_APP_NAME, ZohoCrmError } from '../constants';
import { zohoCrmApiClient } from '../helpers/constants';
import { extractZohoCrmErrorMessage } from '../helpers/extract-error';
import { getZohoCRMModuleFieldAllowedValues } from '../helpers/get-field-allowed-values';
import { getZohoCRMModuleApiNameAllowedValues } from '../helpers/get-module-allowed-values';
import { getZohoCrmModuleFieldsResponseType } from '../helpers/get-module-fields';
import { getZohoCrmRecordIdAllowedValues } from '../helpers/get-record-id-allowed-values';

const action = 'list_records';

const options = {
  module: {
    type: 'string',
    required: true,
    get_allowed_values: getZohoCRMModuleApiNameAllowedValues,
    on_change: ['refetch'],
  },
  fields: {
    required: true,
    type: {
      type: 'list',
      element_type: 'string',
    },
    default_value: ['id'],
    element_allowed_values_creatable: true,
    get_element_allowed_values: getZohoCRMModuleFieldAllowedValues,
  },
  per_page: {
    type: 'integer',
    required: false,
    preselected: true,
    default_value: 20,
  },
  page_token: {
    type: 'string',
    required: false,
  },
  ids: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    depends_on: ['module'],
    required: false,
    get_element_allowed_values: getZohoCrmRecordIdAllowedValues,
  },
  sort: {
    required: false,
    type: {
      type: 'hash',
      fields: {
        sort_by: {
          type: 'string',
          required: true,
          allowed_values_creatable: true,
          allowed_values: [
            { value: 'id', display_name: 'ID' },
            { value: 'Created_Time', display_name: 'Created Time' },
            { value: 'Modified_Time', display_name: 'Modified Time' },
          ],
        },
        order: {
          type: 'string',
          required: true,
          default_value: 'desc',
          allowed_values: [
            { display_name: 'Ascending', value: 'asc' },
            { display_name: 'Descending', value: 'desc' },
          ],
        },
      },
    },
  },
} satisfies TQoreOptions;

type TListRecordsResponse = {
  data: Array<{
    id: string;
    [key: string]: any;
  }>;
  info: {
    next_page_token?: string;
    previous_page_token?: string;
    count: number;
  };
};

const ListRecords = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ZOHO_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, module, url } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['url', 'token'],
      optionFields: ['module'],
      ErrorClass: ZohoCrmError,
    });

    const per_page = String(Math.min(200, obj?.per_page || 20));
    const sort_order = obj?.sort?.order || 'desc';
    const sort_by = obj?.sort?.sort_by || 'id';
    const fields = (obj?.fields || ['id']).join(',');

    try {
      const response = await zohoCrmApiClient<TListRecordsResponse>({
        path: `${module}`,
        method: 'GET',
        token,
        url,
        params: {
          per_page,
          sort_order,
          sort_by,
          fields,
          ...(obj?.page_token && { page_token: obj.page_token }),
        },
      });

      return {
        records: response.data,
        info: pick(response.info, ['next_page_token', 'previous_page_token']),
      };
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
      records: {
        type: 'list',
      },
      info: {
        type: {
          type: 'hash',
          fields: {
            next_page_token: { type: 'string' },
            previous_page_token: { type: 'string' },
          },
        },
      },
    },
  },

  get_dynamic_response_type: async (context) => {
    const { fields = [] } = getQoreContextRequiredValues({
      context,
      optionFields: ['fields'],
    });

    const responseType = (await getZohoCrmModuleFieldsResponseType(
      context
    )) as IQoreTypeObjectNonList;

    const selectedFields = pick(responseType.fields, fields) as Record<
      string,
      TQoreAppActionOption
    >;

    return {
      type: 'hash',
      fields: {
        info: {
          type: {
            type: 'hash',
            fields: {
              next_page_token: { type: 'string' },
              previous_page_token: { type: 'string' },
            },
          },
        },
        records: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: selectedFields,
            },
          },
        },
      },
    };
  },
});

export default ListRecords;
