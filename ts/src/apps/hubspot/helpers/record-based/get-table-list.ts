import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { HubspotError } from '../../constants';
import { createHubspotClient } from '../constants';

export const HubspotTableList = [
  'companies',
  'contacts',
  'deals',
  'tickets',
  'appointments',
  'calls',
  'communications',
  'courses',
  'emails',
  'leads',
  'line_items',
  'listings',
  'marketing_events',
  'meetings',
  'notes',
  'orders',
  'products',
  'quotes',
  'services',
  'subscriptions',
  'tasks',
  'users',
] as const;

export const getHubspotTableList: TQoreGetTableListFunction = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: HubspotError,
  });

  const client = createHubspotClient(token);

  try {
    const schemas = await client.crm.schemas.coreApi.getAll();
    const schemaNames = schemas.results.map((schema) => schema.name);

    return Array.from(new Set([...HubspotTableList, ...schemaNames]));
  } catch (error) {
    if (error instanceof HubspotError) {
      throw error;
    }

    throw new HubspotError(`Failed to fetch Hubspot tables: ${error?.message || error}`);
  }
};
