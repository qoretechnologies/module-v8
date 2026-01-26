import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CopperCrmError } from '../constants';
import { fetchCopperCrmAllowedValues } from './constants';

type CopperCrmOpportunity = {
  id: number;
  name: string;
  monetary_value?: number;
  pipeline_stage_id?: number;
  status?: string;
  close_date?: string;
  company_name?: string;
};

const mapOpportunityToAllowedValue = (
  opportunity: CopperCrmOpportunity
): IQoreAllowedValue<number> => {
  const descParts = [];

  if (opportunity.monetary_value) {
    descParts.push(`Value: $${opportunity.monetary_value}`);
  }

  if (opportunity.status) {
    descParts.push(`Status: ${opportunity.status}`);
  }

  if (opportunity.company_name) {
    descParts.push(`Company: ${opportunity.company_name}`);
  }

  if (opportunity.close_date) {
    descParts.push(`Close Date: ${opportunity.close_date}`);
  }

  return {
    value: opportunity.id,
    display_name: opportunity.name,
    ...(descParts.length > 0 && { desc: descParts.join('\n') }),
  };
};

export const getCopperCrmOpportunityAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  try {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: CopperCrmError,
    });

    return await fetchCopperCrmAllowedValues({
      token,
      mapItemToAllowedValue: mapOpportunityToAllowedValue,
      path: 'opportunities/search',
    });
  } catch (error) {
    if (error instanceof CopperCrmError) {
      throw error;
    }

    throw new CopperCrmError(`Failed to fetch CopperCRM opportunity allowed values: ${error}`);
  }
};
