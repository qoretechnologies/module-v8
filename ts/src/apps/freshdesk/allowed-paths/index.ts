import { IQorePartialAppActionWithSwaggerPath } from '@qoretechnologies/ts-toolkit';
import { FRESHDESK_AGENTS_ACTIONS } from './agents';
import { FRESHDESK_COMPANIES_ACTIONS } from './companies';
import { FRESHDESK_CONTACTS_ACTIONS } from './contacts';
import { FRESHDESK_CUSTOM_OBJECTS_ACTIONS } from './custom-objects';
import { FRESHDESK_TICKETS_ACTIONS } from './tickets';

export const FRESHDESK_ACTIONS = [
  ...FRESHDESK_TICKETS_ACTIONS,
  ...FRESHDESK_AGENTS_ACTIONS,
  ...FRESHDESK_CONTACTS_ACTIONS,
  ...FRESHDESK_COMPANIES_ACTIONS,
  ...FRESHDESK_CUSTOM_OBJECTS_ACTIONS,
] satisfies IQorePartialAppActionWithSwaggerPath[];
