import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { MAUTIC_APP_NAME, MauticError } from '../constants';
import { mauticClient } from '../client';
import { getMauticCompaniesAllowedValues } from '../helpers';
import { MauticCompanyResponseType } from '../response-types';

const action = 'get_company';

const options = {
  company: {
    type: 'number',
    required: true,
    get_allowed_values: getMauticCompaniesAllowedValues,
  },
} satisfies TQoreOptions;

const getCompany = QoreAppCreator.createLocalizedAction<typeof options>({
  app: MAUTIC_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { instance_url, username, password, company } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['instance_url', 'username', 'password'],
      optionFields: ['company'],
      ErrorClass: MauticError,
    });

    try {
      const response = await mauticClient.get(`companies/${company}`, {
        connectionOptions: { instance_url, username, password },
      });

      return response;
    } catch (error) {
      throw new MauticError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
  response_type: MauticCompanyResponseType,
});

export default getCompany;
