import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CopperCrmError } from '../constants';
import { fetchCopperCrmAllowedValues } from './constants';

type CopperCrmCompany = {
  id: number;
  name: string;
  email_domain?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
};

const mapCompanyToAllowedValue = (company: CopperCrmCompany): IQoreAllowedValue<number> => {
  const descParts = [];

  if (company.email_domain) {
    descParts.push(`Domain: ${company.email_domain}`);
  }

  if (company.address) {
    const addressParts = [];
    if (company.address.city) addressParts.push(company.address.city);
    if (company.address.state) addressParts.push(company.address.state);
    if (company.address.country) addressParts.push(company.address.country);

    if (addressParts.length > 0) {
      descParts.push(`Location: ${addressParts.join(', ')}`);
    }
  }

  return {
    value: company.id,
    display_name: company.name,
    ...(descParts.length > 0 && { desc: descParts.join('\n') }),
  };
};

export const getCopperCrmCompanyAllowedValues: TQoreGetAllowedValuesFunction<
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
      mapItemToAllowedValue: mapCompanyToAllowedValue,
      path: 'companies/search',
    });
  } catch (error) {
    if (error instanceof CopperCrmError) {
      throw error;
    }

    throw new CopperCrmError(`Failed to fetch CopperCRM company allowed values: ${error}`);
  }
};
