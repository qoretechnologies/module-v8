import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { MAUTIC_APP_NAME, MauticError } from '../constants';
import { mauticClient } from '../client';
import { getMauticCompaniesAllowedValues, getMauticContactsAllowedValues } from '../helpers';

const action = 'add_contact_to_company';

const options = {
  company: {
    type: 'number',
    required: true,
    get_allowed_values: getMauticCompaniesAllowedValues,
  },
  contact: {
    type: 'number',
    required: true,
    get_allowed_values: getMauticContactsAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    companyId: { type: 'number' },
    contactId: { type: 'number' },
  },
} satisfies TQoreResponseType;

const addContactToCompany = QoreAppCreator.createLocalizedAction<typeof options>({
  app: MAUTIC_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { instance_url, username, password, company, contact } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['instance_url', 'username', 'password'],
      optionFields: ['company', 'contact'],
      ErrorClass: MauticError,
    });

    try {
      await mauticClient.post(
        `companies/${company}/contact/${contact}/add`,
        {},
        {
          connectionOptions: { instance_url, username, password },
        }
      );

      return {
        success: true,
        companyId: company,
        contactId: contact,
      };
    } catch (error) {
      throw new MauticError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
});

export default addContactToCompany;
