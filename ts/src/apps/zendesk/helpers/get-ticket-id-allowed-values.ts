import { CreateZendeskGetAllowedValuesFunction } from './create-get-allowed-values-function';

export const getTicketIdAllowedValues = CreateZendeskGetAllowedValuesFunction('tickets', 'subject');
