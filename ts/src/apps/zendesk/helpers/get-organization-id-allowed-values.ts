import { CreateZendeskGetAllowedValuesFunction } from './create-get-allowed-values-function';

export const getOrganizationIdAllowedValues = CreateZendeskGetAllowedValuesFunction(
  'organizations',
  'name',
  {},
  (entity: { id: number; name: string; url: string }) => {
    return `Id: ${entity.id}\n\nName: ${entity.name}`;
  }
);
