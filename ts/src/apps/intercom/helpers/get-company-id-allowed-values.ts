import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getIntercomAllowedValues } from '.';

interface IntercomCompany {
  type: string;
  id: string;
  name: string;
  company_id?: string;
  created_at: number;
  updated_at: number;
  custom_attributes?: Record<string, any>;
  size?: number;
  website?: string;
  industry?: string;
  monthly_spend?: number;
  session_count?: number;
  user_count?: number;
  tags?: {
    type: string;
    data: Array<{ id: string; name: string }>;
  };
}

const mapIntercomCompanyToAllowedValue = (company: IntercomCompany): IQoreAllowedValue<string> => {
  return {
    display_name: company.name || `Company ${company.id}`,
    value: company.id,
    desc:
      `ID: ${company.id}\n\n` +
      `Name: ${company.name}\n\n` +
      `External ID: ${company.company_id || 'None'}\n\n` +
      `Created at: ${new Date(company.created_at * 1000).toISOString()}\n\n` +
      `Updated at: ${new Date(company.updated_at * 1000).toISOString()}\n\n` +
      `Website: ${company.website || 'None'}\n\n` +
      `Industry: ${company.industry || 'None'}\n\n` +
      `User count: ${company.user_count || 0}\n\n` +
      `Session count: ${company.session_count || 0}`,
  };
};

export const getIntercomCompanyIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to fetch Intercom companies');
  }

  return await getIntercomAllowedValues<IntercomCompany>({
    token,
    path: '/companies',
    dataPath: 'data',
    mapFn: mapIntercomCompanyToAllowedValue,
  });
};
