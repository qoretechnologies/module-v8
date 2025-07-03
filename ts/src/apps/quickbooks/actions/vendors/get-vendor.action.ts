import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../../constants';
import { createQuickbooksClient } from '../../helpers/constants';
import { getQuickbooksVendorIdAllowedValues } from '../../helpers/get-vendor-id-allowed-values';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getQuickbooksVendorIdAllowedValues,
  },
} satisfies TQoreOptions;

const getVendor = QoreAppCreator.createLocalizedAction<typeof options>({
  app: QUICKBOOKS_APP_NAME,
  action: 'get_vendor',
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
      const response = await client.getVendor(id);

      return response.Vendor;
    } catch (error) {
      throw new QuickbooksError(`Failed to get vendor: ${error.message || error}`);
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

export default getVendor;
