import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export const MAILCHIMP_CONN_OPTIONS = {
  datacenter: {
    type: 'string',
    display_name: 'Datacenter',
    short_desc: 'Datacenter',
    desc: 'Datacenter',
  },
  url: {
    type: 'string',
  },
} satisfies TCustomConnOptions;
