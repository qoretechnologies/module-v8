import { CreateZendeskGetAllowedValuesFunction } from './create-get-allowed-values-function';

export const getAgentIdAllowedValues = CreateZendeskGetAllowedValuesFunction('users', 'name', {
  role: 'agent',
});
