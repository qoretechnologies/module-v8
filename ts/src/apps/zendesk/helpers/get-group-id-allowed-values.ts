import { url } from 'inspector';
import { CreateZendeskGetAllowedValuesFunction } from './create-get-allowed-values-function';

export const getGroupIdAllowedValues = CreateZendeskGetAllowedValuesFunction(
  'groups',
  'name',
  {},
  (entity: { id: number; name: string; description: string; url: string }) => {
    return (
      `Id: ${entity.id}\n\nName: ${entity.name}\n\n` +
      `Description: ${entity.description}\n\nLink: [View in Zendesk]${url}`
    );
  }
);
