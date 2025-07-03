import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient } from '../../helpers/constants';
import { getQuickbooksCustomerIdAllowedValues } from '../../helpers/get-customer-id-allowed-values';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getQuickbooksCustomerIdAllowedValues,
  },
} satisfies TQoreOptions;

const getCustomer = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'get_customer',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, realm_id, instance_type, id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'realm_id', 'instance_type'],
      optionFields: ['id'],
      ErrorClass: QuickbooksError,
    });

    const client = createQuickbooksClient({
      token,
      realm_id,
      instance_type,
    });

    try {
      const response = await client.getCustomer(id);

      return response.Customer;
    } catch (error) {
      throw new QuickbooksError(`Failed to get customer: ${error.message || error}`);
    }
  },
  response_type: {
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
});

export default getCustomer;
