export const PipedriveTables = [
  'deals',
  'persons',
  'organizations',
  'activities',
  'products',
  'leads',
  'notes',
  'tasks',
] as const;

export const usePipedriveV1Endpoint = (tableName: string): boolean => {
  return ['leads', 'notes', 'tasks'].includes(tableName);
};

export type TPipedriveTable = (typeof PipedriveTables)[number];

export const PipedriveTableToFilterTypeMap: Record<TPipedriveTable, string> = {
  deals: 'deals',
  persons: 'people',
  organizations: 'org',
  products: 'products',
  activities: 'activity',
  leads: 'leads',
  notes: 'notes',
  tasks: 'tasks',
};

export const PipedriveTableToObjectMap: Record<TPipedriveTable, string> = {
  deals: 'deal',
  persons: 'person',
  organizations: 'organization',
  products: 'product',
  activities: 'activity',
  leads: 'lead',
  notes: 'note',
  tasks: 'task',
};
