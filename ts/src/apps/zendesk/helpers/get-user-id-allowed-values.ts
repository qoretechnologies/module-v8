import { CreateZendeskGetAllowedValuesFunction } from './create-get-allowed-values-function';

export const getUserIdAllowedValues = CreateZendeskGetAllowedValuesFunction(
  'users',
  'name',
  {},
  (entity: { id: number; name: string; email: string }) => {
    return `Id: ${entity.id}\n\nName: ${entity.name}\n\nEmail: ${entity.email}`;
  }
);
