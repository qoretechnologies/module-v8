import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export const FRESHDESK_CONN_OPTIONS = {
  subdomain: {
    display_name: 'Subdomain',
    short_desc: 'Your Freshdesk account subdomain',
    desc:
      `To get your Freshdesk subdomain (\`<your_subdomain>.freshdesk.com\`):\n\n` +
      `- Go to your Freshdesk account\n\n` +
      `- Copy the subdomain from the URL`,
    type: 'string',
  },
  apiKey: {
    display_name: 'API Key',
    short_desc: 'Your Freshdesk account API key',
    desc:
      `To get your API key:\n\n` +
      `- Go to your Freshdesk account\n\n` +
      `- On top right corder press on your profile icon\n\n` +
      `- Go to Profile settings\n\n` +
      `- Press View Api Key\n\n` +
      `- Copy your API key`,
    type: 'string',
  },
  url: {
    type: 'string',
  },
  token: {
    type: 'string',
  },
} satisfies TCustomConnOptions;
