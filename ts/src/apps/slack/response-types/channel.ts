import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

/**
 * Slack channel response type
 */
export const SlackChannelResponseType = {
  type: 'hash',
  fields: {
    id: {
      type: 'string',
      short_desc: 'Unique identifier for the channel',
    },
    name: {
      type: 'string',
      short_desc: 'Name of the channel',
    },
    is_channel: {
      type: 'bool',
      short_desc: 'Whether this is a regular channel',
    },
    is_group: {
      type: 'bool',
      short_desc: 'Whether this is a private group',
    },
    is_im: {
      type: 'bool',
      short_desc: 'Whether this is a direct message',
    },
    is_mpim: {
      type: 'bool',
      short_desc: 'Whether this is a multi-person direct message',
    },
    is_private: {
      type: 'bool',
      short_desc: 'Whether the channel is private',
    },
    created: {
      type: 'integer',
      short_desc: 'Unix timestamp when the channel was created',
    },
    is_archived: {
      type: 'bool',
      short_desc: 'Whether the channel is archived',
    },
    is_general: {
      type: 'bool',
      short_desc: 'Whether this is the general channel',
    },
    name_normalized: {
      type: 'string',
      short_desc: 'Normalized name of the channel',
    },
    is_shared: {
      type: 'bool',
      short_desc: 'Whether the channel is shared',
    },
    is_org_shared: {
      type: 'bool',
      short_desc: 'Whether the channel is shared across organizations',
    },
    is_member: {
      type: 'bool',
      short_desc: 'Whether the current user is a member',
    },
    context_team_id: {
      type: 'string',
      short_desc: 'Team ID in the current context',
    },
  },
} satisfies TQoreResponseType;

/**
 * Create channel response type
 */
export const SlackCreateChannelResponseType = {
  type: 'hash',
  fields: {
    ok: {
      type: 'bool',
      short_desc: 'Indicates if the operation was successful',
    },
    channel: { type: SlackChannelResponseType },
  },
} satisfies TQoreResponseType;

/**
 * TypeScript type for Slack channel
 */
export type TSlackChannel = {
  id: string;
  name: string;
  is_channel?: boolean;
  is_group?: boolean;
  is_im?: boolean;
  is_mpim?: boolean;
  is_private?: boolean;
  created?: number;
  is_archived?: boolean;
  is_general?: boolean;
  name_normalized?: string;
  is_shared?: boolean;
  is_org_shared?: boolean;
  is_member?: boolean;
  context_team_id?: string;
};
