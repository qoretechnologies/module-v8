import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../../helpers/constants';

const options = {
  display_name: {
    type: 'string',
    required: true,
  },
  given_name: {
    type: 'string',
    required: false,
  },
  middle_name: {
    type: 'string',
    required: false,
  },
  family_name: {
    type: 'string',
    required: false,
  },
  title: {
    type: 'string',
    required: false,
  },
  suffix: {
    type: 'string',
    required: false,
  },
  company_name: {
    type: 'string',
    required: false,
  },
  email: {
    type: 'string',
    required: false,
  },
  billing_address: {
    type: {
      type: 'hash',
      fields: {
        Line1: { type: 'string', required: false },
        Line2: { type: 'string', required: false },
        City: { type: 'string', required: false },
        PostalCode: { type: 'string', required: false },
        CountrySubDivisionCode: { type: 'string', required: false },
        Country: { type: 'string', required: false },
      },
    },
  },
  shipping_address: {
    type: {
      type: 'hash',
      fields: {
        Line1: { type: 'string', required: false },
        Line2: { type: 'string', required: false },
        City: { type: 'string', required: false },
        PostalCode: { type: 'string', required: false },
        CountrySubDivisionCode: { type: 'string', required: false },
        Country: { type: 'string', required: false },
      },
    },
  },
} satisfies TQoreOptions;

const createCustomer = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'create_customer',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, realm_id, instance_type, display_name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'realm_id', 'instance_type'],
      optionFields: ['display_name'],
      ErrorClass: QuickbooksError,
    });

    const GivenName = obj?.given_name;
    const MiddleName = obj?.middle_name;
    const FamilyName = obj?.family_name;
    const Title = obj?.title;
    const Suffix = obj?.suffix;
    const CompanyName = obj?.company_name;
    const PrimaryEmailAddr = obj?.email;
    const BillAddr = obj?.billing_address;
    const ShipAddr = obj?.shipping_address;

    const client = createQuickbooksClient({
      token,
      realm_id,
      instance_type,
    });

    try {
      const response = await client.createCustomer({
        DisplayName: display_name,
        ...(GivenName && { GivenName }),
        ...(MiddleName && { MiddleName }),
        ...(FamilyName && { FamilyName }),
        ...(Title && { Title }),
        ...(Suffix && { Suffix }),
        ...(CompanyName && { CompanyName }),
        ...(PrimaryEmailAddr && { PrimaryEmailAddr: { Address: PrimaryEmailAddr } }),
        ...(BillAddr && { BillAddr }),
        ...(ShipAddr && { ShipAddr }),
      });

      return response.Customer;
    } catch (error) {
      throw new QuickbooksError(`Failed to create customer: ${getQuickbooksErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      Taxable: { type: 'bool' },
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
      Job: { type: 'bool' },
      BillWithParent: { type: 'bool' },
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
      IsProject: { type: 'bool' },
      ClientEntityId: { type: 'string' },
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
      GivenName: { type: 'string' },
      FamilyName: { type: 'string' },
      FullyQualifiedName: { type: 'string' },
      CompanyName: { type: 'string' },
      DisplayName: { type: 'string' },
      PrintOnCheckName: { type: 'string' },
      Active: { type: 'bool' },
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

export default createCustomer;
