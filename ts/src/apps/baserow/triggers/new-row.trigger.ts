import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { BASEROW_APP_NAME, BaserowError } from '../constants';
import { baserowApiClient } from '../helpers/constants';
import { getBaserowTableColumnsResponseType } from '../helpers/get-table-fields';
import { getBaserowTableFieldNamesAllowedValues } from '../helpers/get-table-fields-allowed-values';
import { getBaserowTableAllowedValues } from '../helpers/get-table-allowed-values';

const action = 'new_document';

const options = {
  table: {
    type: 'number',
    required: true,
    get_allowed_values: getBaserowTableAllowedValues,
    on_change: ['refetch'],
  },
  search: {
    type: 'string',
    required: false,
  },
  filter: {
    type: {
      type: 'hash',
      fields: {
        filters: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                type: {
                  required: true,
                  type: 'string',
                  allowed_values: [
                    { value: 'equal', display_name: 'Equal' },
                    { value: 'not_equal', display_name: 'Not Equal' },
                    { value: 'empty', display_name: 'Empty' },
                    { value: 'not_empty', display_name: 'Not Empty' },
                    { value: 'contains', display_name: 'Contains' },
                    { value: 'contains_not', display_name: `Doesn't contain` },
                    { value: 'contains_word', display_name: `Contains Word` },
                    { value: 'doesnt_contain_word', display_name: `Doesn't Contain Word` },
                    { value: 'length_is_lower_than', display_name: 'Length is lower than' },
                  ],
                },
                field: {
                  required: true,
                  type: 'string',
                  get_allowed_values: getBaserowTableFieldNamesAllowedValues,
                },
                value: {
                  type: 'softstring',
                  required: true,
                },
              },
            },
          },
        },
        filter_type: {
          type: 'string',
          allowed_values: [
            { value: 'AND', display_name: 'AND' },
            { value: 'OR', display_name: 'OR' },
          ],
        },
      },
    },
  },
} satisfies TQoreOptions;

const NewRow = QoreAppCreator.createLocalizedTrigger({
  app: BASEROW_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, table, url } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      optionFields: ['table'],
      ErrorClass: BaserowError,
    });

    const { filter, search } = context.opts || {};

    const getItems = () => {
      return fetchLatestRows({
        token,
        table,
        url,
        filter,
        search,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `baserow_${action}`,
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, table, url } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      optionFields: ['table'],
      ErrorClass: BaserowError,
    });

    const { filter, search } = context.opts || {};

    const rows = await fetchLatestRows({
      token,
      table,
      url,
      filter,
      search,
    });

    return rows?.length > 0 ? rows[0] : null;
  },
  event_info: {
    desc: 'Baserow New Row Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'number' },
      },
    },
  },
  get_dynamic_type: getBaserowTableColumnsResponseType,
});

export default NewRow;

type TFetchRowsOptions = {
  token: string;
  table: number;
  url: string;
  search?: string;
  filter?: {
    filters: Array<{
      type: string;
      field: string;
      value: string;
    }>;
    filter_type?: string;
  };
};

const fetchLatestRows = async (
  options: TFetchRowsOptions
): Promise<
  Array<{
    id: number;
    [key: string]: any;
  }>
> => {
  const { token, table, url, filter, search } = options;
  const limit = 100;

  let filterString: string | undefined;

  if (filter) {
    filterString = JSON.stringify(filter);
  }

  try {
    const count = await getBaserowRowCount(options);

    if (!count) {
      return [];
    }

    const page = Math.ceil(count / limit);

    const response = await baserowApiClient<{ results: ReturnType<typeof fetchLatestRows> }>({
      path: `database/rows/table/${table}`,
      method: 'GET',
      params: {
        size: String(limit),
        page: String(page),
        user_field_names: 'true',
        ...(filterString && { filter: filterString }),
        ...(search && { search }),
      },
      token,
      url,
    });

    return response.results || [];
  } catch (error) {
    throw new BaserowError(`Failed to fetch latest rows: ${error.message || error}`);
  }
};

const getBaserowRowCount = async (options: TFetchRowsOptions): Promise<number> => {
  const { token, table, url, filter, search } = options;

  try {
    const response = await baserowApiClient<{ count: number }>({
      path: `database/rows/table/${table}/count`,
      method: 'GET',
      params: {
        ...(filter && { filter: JSON.stringify(filter) }),
        ...(search && { search }),
      },
      token,
      url,
    });

    return response.count || 0;
  } catch (error) {
    return 0;
  }
};
