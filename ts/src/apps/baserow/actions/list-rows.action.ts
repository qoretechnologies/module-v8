import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { baserowClient } from '../client';
import { BASEROW_APP_NAME, BaserowError } from '../constants';
import { getBaserowTableAllowedValues } from '../helpers/get-table-allowed-values';
import { getBaserowTableColumnsResponseType } from '../helpers/get-table-fields';
import { getBaserowTableFieldNamesAllowedValues } from '../helpers/get-table-fields-allowed-values';

const action = 'list_rows';

const options = {
  table: {
    type: 'number',
    required: true,
    get_allowed_values: getBaserowTableAllowedValues,
    on_change: ['refetch'],
  },
  page: {
    type: 'number',
    required: false,
  },
  size: {
    type: 'number',
    required: false,
    default_value: 100,
  },
  search: {
    type: 'string',
    required: false,
  },
  order: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          get_allowed_values: getBaserowTableFieldNamesAllowedValues,
        },
        direction: {
          type: 'string',
          allowed_values: [
            { value: '+', display_name: 'Ascending' },
            { value: '-', display_name: 'Descending' },
          ],
        },
      },
    },
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

const listRows = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BASEROW_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, url, table } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'url'],
      optionFields: ['table'],
      ErrorClass: BaserowError,
    });

    const { size = 100, page = 1, order, filter, search } = obj || {};

    let orderString: string | undefined;
    let filterString: string | undefined;

    if (filter) {
      filterString = JSON.stringify(filter);
    }

    if (order) {
      const direction = order.direction || '+';
      orderString = `${direction}${order.field}`;
    }

    try {
      const response = await baserowClient.get<{ id: string }[]>(`database/rows/table/${table}`, {
        token,
        connectionOptions: { url },
        params: {
          size: String(size),
          page: String(page),
          user_field_names: 'true',
          ...(orderString && { order_by: orderString }),
          ...(filterString && { filter: filterString }),
          ...(search && { search }),
        },
      });

      return { ...omit(response, ['next', 'previous']), current_page: page };
    } catch (error) {
      throw new BaserowError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      count: { type: 'number' },
      current_page: { type: 'number' },
      results: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'number' },
              order: { type: 'number' },
            },
          },
        },
      },
    },
  },
  get_dynamic_response_type: async (context) => {
    const fields = await getBaserowTableColumnsResponseType(context);

    return {
      type: 'hash',
      fields: {
        count: { type: 'number' },
        current_page: { type: 'number' },
        results: {
          type: {
            type: 'list',
            element_type: fields,
          },
        },
      },
    };
  },
});

export default listRows;
