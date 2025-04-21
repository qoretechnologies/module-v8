import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export const DYNAMICS_CONN_OPTIONS = {
  url: {
    type: 'string',
  },
  tenant: {
    type: 'string',
  },
} satisfies TCustomConnOptions;

export const DYNAMICS_APP_NAME = 'Dynamics';
export const DYNAMICS_APP_MODULE = 'CdsRestDataProvider';

export const formatDynamicsUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;

  return url.replace('dynamics://', 'https://').replace(/\/+$/, '');
};
