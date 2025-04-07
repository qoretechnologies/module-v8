import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { SHOPIFY_CONN_OPTIONS } from '../constants';
import { executeShopifyGraphQL, ShopifyError } from './constants';

export const getShopifyTaxExemptionsAllowedValues: TQoreGetAllowedValuesFunction<
  typeof SHOPIFY_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  try {
    const query = `
      query {
        __type(name: "TaxExemption") {
          enumValues {
            name
            description
          }
        }
      }
    `;

    const response = await executeShopifyGraphQL(context, query);
    const enumValues = response.data?.__type?.enumValues || [];

    return enumValues.map((exemption: { name: string; description: string }) => ({
      display_name: formatExemptionName(exemption.name),
      value: exemption.name,
      short_desc: exemption.description || '',
    }));
  } catch (error) {
    if (error instanceof ShopifyError) {
      throw error;
    }
    throw new ShopifyError(`Failed to fetch tax exemptions: ${error.message}`, error);
  }
};

const formatExemptionName = (code: string): string => {
  if (code === 'EXEMPT_ALL') {
    return 'Exempt from all taxes';
  }

  const parts = code.split('_');
  if (parts.length < 2) return code;

  const country = parts[0];
  const region = parts[1];
  const type = parts.slice(2).join(' ');

  const countryNames = {
    CA: 'Canada',
    US: 'United States',
    AU: 'Australia',
    GB: 'United Kingdom',
    EU: 'European Union',
  } as const;

  const countryName = countryNames[country as keyof typeof countryNames] || country;

  let formattedName = `${countryName} - ${region}`;
  if (type) {
    formattedName += ` ${type.replace(/_/g, ' ')}`;
  }

  return formattedName;
};
