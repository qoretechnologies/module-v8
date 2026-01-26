import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../../helpers/constants';
import { QuickBooksOperatorsAllowedValues } from '../../helpers/get-filter-operator-allowed-values';
import { QuickBooksItemFieldsAllowedValues } from '../../helpers/get-item-fields-allowed-values';

const options = {
  fetchAll: {
    type: 'bool',
    required: false,
    default_value: false,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 50,
  },
  offset: {
    type: 'integer',
    required: false,
    default_value: 0,
  },
  filter: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values_creatable: true,
          allowed_values: QuickBooksItemFieldsAllowedValues,
        },
        operator: {
          type: 'string',
          required: false,
          allowed_values: QuickBooksOperatorsAllowedValues,
        },
        value: { type: 'softstring', required: true },
      },
    },
  },
  sort: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values_creatable: true,
          allowed_values: QuickBooksItemFieldsAllowedValues,
        },
        direction: {
          type: 'string',
          required: false,
          default_value: 'asc',
          allowed_values: [
            { value: 'asc', display_name: 'Ascending' },
            { value: 'desc', display_name: 'Descending' },
          ],
        },
      },
    },
  },
} satisfies TQoreOptions;

const listItems = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'list_items',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, realm_id, instance_type } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'realm_id', 'instance_type'],
      ErrorClass: QuickbooksError,
    });

    const limit = obj?.limit || 50;
    const offset = obj?.offset || 0;
    const filter = obj?.filter;
    const sort = obj?.sort;
    const fetchAll = obj?.fetchAll || false;

    const client = createQuickbooksClient({
      token,
      realm_id,
      instance_type,
    });

    try {
      const response = await client.findItems({
        limit,
        offset,
        fetchAll,
        ...(filter && {
          field: filter.field,
          operator: filter.operator || '=',
          value: filter.value,
        }),
        ...(sort && {
          [sort.direction]: sort.field,
        }),
      });

      return {
        total_count: response.QueryResponse.maxResults,
        items: response.QueryResponse.Item || [],
      };
    } catch (error) {
      throw new QuickbooksError(`Failed to list items: ${getQuickbooksErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      items: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              Name: { type: 'string' },
              Active: { type: 'bool' },
              FullyQualifiedName: { type: 'string' },
              Taxable: { type: 'bool' },
              UnitPrice: { type: 'number' },
              Type: { type: 'string' },
              IncomeAccountRef: {
                type: {
                  type: 'hash',
                  fields: {
                    value: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
              PurchaseCost: { type: 'number' },
              TrackQtyOnHand: { type: 'bool' },
              domain: { type: 'string' },
              sparse: { type: 'bool' },
              Id: { type: 'string' },
              SyncToken: { type: 'string' },
              MetaData: {
                type: {
                  type: 'hash',
                  fields: {
                    CreateTime: { type: 'string' },
                    LastUpdatedTime: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      total_count: { type: 'integer' },
    },
  },
});

export default listItems;
