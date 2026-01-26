import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { MAUTIC_APP_NAME, MauticError } from '../constants';
import { mauticClient } from '../client';
import { MauticCompanyResponseType, TMauticCompany } from '../response-types';

const action = 'create_company';

const options = {
  companyname: {
    type: 'string',
    required: true,
  },
  companyemail: {
    type: 'string',
    required: false,
    preselected: true,
  },
  companyphone: {
    type: 'string',
    required: false,
    preselected: true,
  },
  companywebsite: {
    type: 'string',
    required: false,
  },
  companyaddress1: {
    type: 'string',
    required: false,
  },
  companyaddress2: {
    type: 'string',
    required: false,
  },
  companycity: {
    type: 'string',
    required: false,
  },
  companystate: {
    type: 'string',
    required: false,
  },
  companyzipcode: {
    type: 'string',
    required: false,
  },
  companycountry: {
    type: 'string',
    required: false,
  },
  companydescription: {
    type: 'string',
    required: false,
  },
  companyindustry: {
    type: 'string',
    required: false,
  },
  custom_fields: {
    type: 'hash',
    required: false,
  },
} satisfies TQoreOptions;

const createCompany = QoreAppCreator.createLocalizedAction<typeof options>({
  app: MAUTIC_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { instance_url, username, password, companyname } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['instance_url', 'username', 'password'],
      optionFields: ['companyname'],
      ErrorClass: MauticError,
    });

    const {
      companyemail,
      companyphone,
      companywebsite,
      companyaddress1,
      companyaddress2,
      companycity,
      companystate,
      companyzipcode,
      companycountry,
      companydescription,
      companyindustry,
      custom_fields,
    } = obj || {};

    try {
      const response = await mauticClient.post<{ company: TMauticCompany }>(
        'companies/new',
        {
          companyname,
          ...(companyemail && { companyemail }),
          ...(companyphone && { companyphone }),
          ...(companywebsite && { companywebsite }),
          ...(companyaddress1 && { companyaddress1 }),
          ...(companyaddress2 && { companyaddress2 }),
          ...(companycity && { companycity }),
          ...(companystate && { companystate }),
          ...(companyzipcode && { companyzipcode }),
          ...(companycountry && { companycountry }),
          ...(companydescription && { companydescription }),
          ...(companyindustry && { companyindustry }),
          ...(custom_fields && custom_fields),
        },
        {
          connectionOptions: { instance_url, username, password },
        }
      );

      return response;
    } catch (error) {
      throw new MauticError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
  response_type: MauticCompanyResponseType,
});

export default createCompany;
