import { CreateZendeskGetAllowedValuesFunction } from './create-get-allowed-values-function';

export const getBrandIdAllowedValues = CreateZendeskGetAllowedValuesFunction(
  'brands',
  'name',
  {},
  (entity: { subdomain: string; active: boolean }) => {
    return `Subdomain: ${entity.subdomain}\n\nActive: ${entity.active}\n\n`;
  }
);
