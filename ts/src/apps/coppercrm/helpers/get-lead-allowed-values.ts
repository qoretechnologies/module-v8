import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CopperCrmError } from '../constants';
import { fetchCopperCrmAllowedValues } from './constants';

type CopperCrmLead = {
  id: number;
  name: string;
  email?: {
    email: string;
  };
  company_name?: string;
  status?: string;
};

const mapLeadToAllowedValue = (lead: CopperCrmLead): IQoreAllowedValue<number> => {
  const descParts = [];

  if (lead.email?.email) {
    descParts.push(`Email: ${lead.email.email}`);
  }

  if (lead.company_name) {
    descParts.push(`Company: ${lead.company_name}`);
  }

  if (lead.status) {
    descParts.push(`Status: ${lead.status}`);
  }

  return {
    value: lead.id,
    display_name: lead.name,
    ...(descParts.length > 0 && { desc: descParts.join('\n') }),
  };
};

export const getCopperCrmLeadAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  try {
    const { token, email } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'email'],
      ErrorClass: CopperCrmError,
    });

    return await fetchCopperCrmAllowedValues({
      token,
      email,
      mapItemToAllowedValue: mapLeadToAllowedValue,
      path: 'leads/search',
    });
  } catch (error) {
    if (error instanceof CopperCrmError) {
      throw error;
    }

    throw new CopperCrmError(`Failed to fetch CopperCRM lead allowed values: ${error}`);
  }
};
