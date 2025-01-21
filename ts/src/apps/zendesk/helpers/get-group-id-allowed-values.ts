import { CreateZendeskGetAllowedValuesFunction } from './create-get-allowed-values-function';

export const getGroupIdAllowedValues = CreateZendeskGetAllowedValuesFunction(
  'groups',
  'name',
  {},
  (entity: { id: number; name: string; description: string; url: string }) => {
    return `Id: ${entity.id}\n\nName: ${entity.name}\n\nDescription: ${entity.description}\n\n`;
  }
);
