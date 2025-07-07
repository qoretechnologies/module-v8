import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../../helpers/constants';
import { QuickBooksOperatorsAllowedValues } from '../../helpers/get-filter-operator-allowed-values';
import { QuickBooksCustomerFieldsAllowedValues } from '../../helpers/get-customer-fields-allowed-values';

const options = {
  fetchAll: {
    type: 'boolean',
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
          allowed_values: QuickBooksCustomerFieldsAllowedValues,
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
          allowed_values: QuickBooksCustomerFieldsAllowedValues,
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

const listCustomers = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'list_customers',
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
      const response = await client.findCustomers({
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
        customers: response.QueryResponse.Customer || [],
      };
    } catch (error) {
      throw new QuickbooksError(`Failed to list customers: ${getQuickbooksErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      customers: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              Taxable: { type: 'boolean' },
              BillAddr: {
                type: {
                  type: 'hash',
                  fields: {
                    Id: { type: 'string' },
                    Line1: { type: 'string' },
                    City: { type: 'string' },
                    CountrySubDivisionCode: { type: 'string' },
                    PostalCode: { type: 'string' },
                    Lat: { type: 'string' },
                    Long: { type: 'string' },
                  },
                },
              },
              ShipAddr: {
                type: {
                  type: 'hash',
                  fields: {
                    Id: { type: 'string' },
                    Line1: { type: 'string' },
                    City: { type: 'string' },
                    CountrySubDivisionCode: { type: 'string' },
                    PostalCode: { type: 'string' },
                    Lat: { type: 'string' },
                    Long: { type: 'string' },
                  },
                },
              },
              Job: { type: 'boolean' },
              BillWithParent: { type: 'boolean' },
              Balance: { type: 'number' },
              BalanceWithJobs: { type: 'number' },
              CurrencyRef: {
                type: {
                  type: 'hash',
                  fields: {
                    value: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
              PreferredDeliveryMethod: { type: 'string' },
              IsProject: { type: 'boolean' },
              ClientEntityId: { type: 'string' },
              domain: { type: 'string' },
              sparse: { type: 'boolean' },
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
              GivenName: { type: 'string' },
              FamilyName: { type: 'string' },
              FullyQualifiedName: { type: 'string' },
              CompanyName: { type: 'string' },
              DisplayName: { type: 'string' },
              PrintOnCheckName: { type: 'string' },
              Active: { type: 'boolean' },
              V4IDPseudonym: { type: 'string' },
              PrimaryPhone: {
                type: {
                  type: 'hash',
                  fields: {
                    FreeFormNumber: { type: 'string' },
                  },
                },
              },
              PrimaryEmailAddr: {
                type: {
                  type: 'hash',
                  fields: {
                    Address: { type: 'string' },
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

export default listCustomers;
