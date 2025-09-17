import { Client } from '@microsoft/microsoft-graph-client';

export const createActiveDirectoryClient = (token: string) => {
  const client = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: () => Promise.resolve(token!),
    },
  });

  return client;
};

export const getActiveDirectoryFilterString = (
  filter: { field: string; operator?: string; value: string } | undefined
) => {
  if (!filter?.field || !filter?.value) {
    return null;
  }

  const { field, operator = 'eq', value } = filter;

  if (['eq', 'ne'].includes(operator)) {
    return `${field} ${operator} '${value}'`;
  }

  if (['startsWith', 'endsWith'].includes(operator)) {
    return `${operator}(${field}, '${value}')`;
  }

  return `${field} ${operator} '${value}'`;
};
