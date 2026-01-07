import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export const ZENDESK_CONN_OPTIONS = {
  subdomain: {
    display_name: 'Subdomain',
    short_desc: 'The subdomain for the URL',
    desc: 'The subdomain for the URL',
    type: 'string',
  },
} satisfies TCustomConnOptions;
