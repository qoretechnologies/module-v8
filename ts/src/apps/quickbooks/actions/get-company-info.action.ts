import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { QUICKBOOKS_APP_NAME, QuickbooksError } from '../constants';
import { createQuickbooksClient, getQuickbooksErrorMessage } from '../helpers/constants';

const getCompanyInfo = QoreAppCreator.createLocalizedAction({
  app: QUICKBOOKS_APP_NAME,
  action: 'get_company_info',
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token, realm_id, instance_type } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'realm_id', 'instance_type'],
      ErrorClass: QuickbooksError,
    });

    const client = createQuickbooksClient({
      token,
      realm_id,
      instance_type,
    });

    try {
      const companiesResponse = await client.findCompanyInfos();

      if (!companiesResponse || !companiesResponse.QueryResponse.CompanyInfo?.length) {
        throw new QuickbooksError('No company information found.');
      }

      return companiesResponse.QueryResponse.CompanyInfo[0];
    } catch (error) {
      throw new QuickbooksError(
        `Failed to get company information: ${getQuickbooksErrorMessage(error)}`
      );
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      CompanyName: { type: 'string' },
      LegalName: { type: 'string' },
      CompanyAddr: {
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
      CustomerCommunicationAddr: {
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
      LegalAddr: {
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
      CustomerCommunicationEmailAddr: {
        type: {
          type: 'hash',
          fields: {
            Address: { type: 'string' },
          },
        },
      },
      PrimaryPhone: {
        type: {
          type: 'hash',
        },
      },
      CompanyStartDate: { type: 'string' },
      FiscalYearStartMonth: { type: 'string' },
      Country: { type: 'string' },
      Email: {
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
        },
      },
      SupportedLanguages: { type: 'string' },
      DefaultTimeZone: { type: 'string' },
      NameValue: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              Name: { type: 'string' },
              Value: { type: 'string' },
            },
          },
        },
      },
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
});

export default getCompanyInfo;
