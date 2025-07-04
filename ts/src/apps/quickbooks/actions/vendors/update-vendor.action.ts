import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../../helpers/constants';
import { getQuickbooksVendorIdAllowedValues } from '../../helpers/get-vendor-id-allowed-values';

const options = {
  id: {
    type: 'string',
    required: false,
    get_allowed_values: getQuickbooksVendorIdAllowedValues,
  },
  display_name: {
    type: 'string',
    required: false,
  },
  phone: {
    type: 'string',
    required: false,
  },
  email: {
    type: 'string',
    required: false,
  },
  website: {
    type: 'string',
    required: false,
  },
  address: {
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

const updateVendor = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'update_vendor',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, realm_id, instance_type, id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'realm_id', 'instance_type'],
      optionFields: ['id'],
      ErrorClass: QuickbooksError,
    });

    const DisplayName = obj?.display_name;
    const PrimaryPhone = obj?.phone;
    const PrimaryEmailAddr = obj?.email;
    const WebAddr = obj?.website;
    const BillAddr = obj?.address;

    const client = createQuickbooksClient({
      token,
      realm_id,
      instance_type,
    });

    try {
      const vendor = await client.getVendor(id);

      const response = await client.updateVendor({
        SyncToken: vendor.Vendor.SyncToken,
        Id: id,
        ...(DisplayName && { DisplayName }),
        ...(PrimaryPhone && { PrimaryPhone: { FreeFormNumber: PrimaryPhone } }),
        ...(PrimaryEmailAddr && { PrimaryEmailAddr: { Address: PrimaryEmailAddr } }),
        ...(WebAddr && { WebAddr: { URI: WebAddr } }),
        ...(BillAddr && { BillAddr }),
      });

      return response.Vendor;
    } catch (error) {
      throw new QuickbooksError(`Failed to update vendor: ${getQuickbooksErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
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
      Balance: { type: 'number' },
      AcctNum: { type: 'string' },
      Vendor1099: { type: 'boolean' },
      CurrencyRef: {
        type: {
          type: 'hash',
          fields: {
            value: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
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
      WebAddr: {
        type: {
          type: 'hash',
          fields: {
            URI: { type: 'string' },
          },
        },
      },
    },
  },
});

export default updateVendor;
