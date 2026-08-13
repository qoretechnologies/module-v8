import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export const ESIGNATURE_CONN_OPTIONS = {
  environment: {
    display_name: 'Environment',
    short_desc: 'Whether to authenticate against the DocuSign demo or production environment',
    desc:
      'Selects the DocuSign account server this connection authenticates against: the developer ' +
      'demo environment (`account-d.docusign.com`) or production (`account.docusign.com`).\n\n' +
      'Production additionally requires the integration key to have been promoted through ' +
      "DocuSign's [go-live review](https://developers.docusign.com/platform/go-live/); an " +
      'integration key that has not been promoted is rejected by the production account server ' +
      'regardless of this setting.\n\n' +
      'The API host itself is not set here — it is discovered after authorization from ' +
      '`/oauth/userinfo` and stored in the base URI option.',
    type: 'string',
    allowed_values: [
      { value: 'account-d', display_name: 'Demo' },
      { value: 'account', display_name: 'Production' },
    ],
    // demo is the environment this application authenticated against before the option existed;
    // defaulting to production would silently repoint every existing connection at a server its
    // integration key is not promoted for
    default_value: 'account-d',
  },
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
