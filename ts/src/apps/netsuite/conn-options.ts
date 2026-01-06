import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export const NETSUITE_CONN_OPTIONS = {
  account_id: {
    display_name: 'Account ID',
    short_desc: 'The account ID',
    desc: 'The account ID',
    type: 'string',
  },
  company: {
    display_name: 'Company',
    short_desc: 'The company',
    desc: 'The company',
    type: 'string',
  },
  oauth2_token_url: {
    display_name: 'OAuth2 Token URL',
    short_desc: 'The custom OAuth2 token URL',
    desc: 'The OAuth2 token URL',
    type: 'string',
  },
} satisfies TCustomConnOptions;
