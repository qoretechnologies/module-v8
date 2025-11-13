import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { ZOHO_CRM_APP_NAME, ZohoCrmError } from '../constants';
import { TZohoCrmRequestOptions, zohoCrmApiClient } from '../helpers/constants';
import { extractZohoCrmErrorMessage } from '../helpers/extract-error';
import { getZohoCRMModuleFieldAllowedValues } from '../helpers/get-field-allowed-values';
import { getZohoCRMModuleApiNameAllowedValues } from '../helpers/get-module-allowed-values';
import {
  getZohoCrmModuleFieldApiNames,
  getZohoCrmModuleFields,
  getZohoCrmModuleFieldsResponseType,
} from '../helpers/get-module-fields';

const action = 'new_record';

const options = {
  module: {
    type: 'string',
    required: true,
    get_allowed_values: getZohoCRMModuleApiNameAllowedValues,
    on_change: ['refetch'],
  },
  phone: {
    type: 'string',
    required: false,
  },
  email: {
    type: 'string',
    required: false,
  },
  word: {
    type: 'string',
    required: false,
  },
  field_filter: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          field: {
            type: 'string',
            required: true,
            allowed_values_creatable: true,
            get_allowed_values: getZohoCRMModuleFieldAllowedValues,
          },
          value: { type: 'string', required: true },
        },
      },
    },
  },
} satisfies TQoreOptions;

const hasFilters = (options: {
  phone?: string;
  email?: string;
  word?: string;
  field_filter?: Array<{ field: string; value: string }>;
}): boolean => {
  const { phone, email, word, field_filter } = options;
  return Boolean(phone || email || word || (field_filter && field_filter.length > 0));
};

const NewRecord = QoreAppCreator.createLocalizedTrigger({
  app: ZOHO_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, module, url } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      optionFields: ['module'],
      ErrorClass: ZohoCrmError,
    });

    const opts = context.opts || {};

    let fields: string[] = [];

    if (!hasFilters(opts)) {
      fields = await getZohoCrmModuleFieldApiNames({
        token,
        url,
        moduleApiName: module,
      });
    }

    const getItems = () => {
      return fetchLatestRecords({
        token,
        url,
        module,
        ...opts,
        fields,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `zohocrm_${action}`,
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, module, url } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      optionFields: ['module'],
      ErrorClass: ZohoCrmError,
    });

    const opts = context.opts || {};

    let fields: string[] = [];

    if (!hasFilters(opts)) {
      fields = (
        await getZohoCrmModuleFields({
          token,
          url,
          moduleApiName: module,
        })
      ).map((field) => field.api_name);
    }

    const rows = await fetchLatestRecords({
      token,
      url,
      module,
      ...opts,
      fields,
    });

    return rows?.length > 0 ? rows[0] : null;
  },
  event_info: {
    desc: 'Zoho CRM New Record Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'number' },
      },
    },
  },
  get_dynamic_type: getZohoCrmModuleFieldsResponseType,
});

export default NewRecord;

type TFetchRowsOptions = {
  token: string;
  module: string;
  url: string;
  phone?: string;
  email?: string;
  word?: string;
  field_filter?: Array<{
    field: string;
    value: string;
  }>;
  fields?: string[];
};

type TRecordsResponse = Array<{ id: number; [key: string]: any }>;

const fetchLatestRecords = async (options: TFetchRowsOptions): Promise<TRecordsResponse> => {
  const { token, module, url, phone, email, word, field_filter, fields } = options;
  const limit = 20;

  let records: Array<{ id: number; [key: string]: any }> = [];

  const commonParams = {
    per_page: String(limit),
    sort_order: 'desc',
    sort_by: 'Created_Time',
  };

  const requestConfig = {
    method: 'GET',
    object: 'data',
    token,
    url,
  } satisfies Partial<TZohoCrmRequestOptions>;

  try {
    if (!phone && !email && !word && (!field_filter || field_filter.length === 0)) {
      records = await zohoCrmApiClient<TRecordsResponse>({
        ...requestConfig,
        path: module,
        params: {
          ...commonParams,
          ...(fields?.length ? { fields: fields.join(',') } : { fields: 'id' }),
        },
      });
    } else {
      let criteria: string | undefined;

      if (field_filter && field_filter.length > 0) {
        criteria = `(${field_filter.map((filter) => `(${filter.field}:equals:${filter.value})`).join(' and ')})`;
      }

      records = await zohoCrmApiClient<TRecordsResponse>({
        ...requestConfig,
        path: `${module}/search`,
        params: {
          ...commonParams,
          ...(phone && { phone }),
          ...(email && { email }),
          ...(word && { word }),
          ...(criteria && { criteria }),
        },
      });
    }

    return records || [];
  } catch (error) {
    throw new ZohoCrmError(`Failed to fetch latest records: ${extractZohoCrmErrorMessage(error)}`);
  }
};
