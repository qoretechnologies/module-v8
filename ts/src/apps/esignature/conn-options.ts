import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export const ESIGNATURE_CONN_OPTIONS = {
  accounts: {
    display_name: 'Account Info',
    short_desc: 'Account info set when the connection is authorized',
    desc: 'Account info set when the connection is authorized',
    type: 'list',
  },
  account_id: {
    display_name: 'Default Account ID',
    short_desc: 'The default account ID set when the connection is authorized',
    desc: 'The default account ID set when the connection is authorized',
    type: 'string',
  },
  base_uri: {
    display_name: 'Default Base URI',
    short_desc: 'The default base URI set when the connection is authorized',
    desc: 'The default base URI set when the connection is authorized',
    type: 'string',
  },
} satisfies TCustomConnOptions;
