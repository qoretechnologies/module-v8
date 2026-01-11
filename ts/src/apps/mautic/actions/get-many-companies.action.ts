import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { MAUTIC_APP_NAME, MauticError } from '../constants';
import { mauticClient } from '../client';
import { MauticCompaniesListResponseType, TMauticCompany } from '../response-types';

const action = 'get_many_companies';

const options = {
  search: {
    type: 'string',
    required: false,
  },
  limit: {
    type: 'number',
    required: false,
    default_value: 30,
  },
  start: {
    type: 'number',
    required: false,
    default_value: 0,
  },
  orderBy: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'id', display_name: 'ID' },
      { value: 'companyname', display_name: 'Company Name' },
      { value: 'date_added', display_name: 'Date Added' },
    ],
  },
  orderByDir: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'asc', display_name: 'Ascending' },
      { value: 'desc', display_name: 'Descending' },
    ],
  },
} satisfies TQoreOptions;

const getManyCompanies = QoreAppCreator.createLocalizedAction<typeof options>({
  app: MAUTIC_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { instance_url, username, password } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['instance_url', 'username', 'password'],
      ErrorClass: MauticError,
    });

    const { search, limit = 30, start = 0, orderBy, orderByDir } = obj || {};

    try {
      const response = await mauticClient.get<{ total: number; companies: Record<string, TMauticCompany> }>(
        'companies',
        {
          connectionOptions: { instance_url, username, password },
          params: {
            limit,
            start,
            ...(search && { search }),
            ...(orderBy && { orderBy }),
            ...(orderByDir && { orderByDir }),
          },
        }
      );

      const companies = response.companies
        ? Object.values(response.companies)
        : [];

      return {
        total: response.total || 0,
        companies,
      };
    } catch (error) {
      throw new MauticError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
  response_type: MauticCompaniesListResponseType,
});

export default getManyCompanies;
