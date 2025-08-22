import {
  ContactsApi,
  ContactsApiApiKeys,
  CompaniesApi,
  DealsApi,
  CompaniesApiApiKeys,
  DealsApiApiKeys,
} from '@getbrevo/brevo';
import { TQoreType } from '@qoretechnologies/ts-toolkit';

export const createBrevoClient = (token: string) => {
  const contactsClient = new ContactsApi();
  const companiesClient = new CompaniesApi();
  const dealsClient = new DealsApi();

  contactsClient.setApiKey(ContactsApiApiKeys.apiKey, token);
  companiesClient.setApiKey(CompaniesApiApiKeys.apiKey, token);
  dealsClient.setApiKey(DealsApiApiKeys.apiKey, token);

  return {
    contactsClient,
    companiesClient,
    dealsClient,
  };
};

export const BrevoAttributeTypeToQoreTypeMap: Record<string, TQoreType> = {
  text: 'string',
  date: 'date',
  float: 'float',
  id: 'number',
  number: 'number',
  boolean: 'boolean',
  'multiple-choice': { type: 'list', element_type: 'string' },
  user: { type: 'string' },
} as const;
