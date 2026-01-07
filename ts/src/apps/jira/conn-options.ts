import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export const JIRA_CONN_OPTIONS = {
  cloud_id: {
    display_name: 'Cloud ID',
    short_desc: 'The cloud ID',
    desc: 'The cloud ID',
    type: 'string',
  },
  ping_path: {
    display_name: 'Ping Path',
    short_desc: 'The custom ping path for oauth',
    desc: 'The path to ping',
    type: 'string',
  },
  swagger_base_path: {
    display_name: 'Swagger Base Path',
    short_desc: 'The custom base path for swagger',
    desc: 'The base path for swagger',
    type: 'string',
  },
} satisfies TCustomConnOptions;
