import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

/**
 * User profile type
 */
const SlackUserProfileType = {
  type: 'hash',
  fields: {
    title: {
      type: 'string',
      short_desc: 'User title',
    },
    phone: {
      type: 'string',
      short_desc: 'Phone number',
    },
    real_name: {
      type: 'string',
      short_desc: 'Real name',
    },
    real_name_normalized: {
      type: 'string',
      short_desc: 'Normalized real name',
    },
    display_name: {
      type: 'string',
      short_desc: 'Display name',
    },
    display_name_normalized: {
      type: 'string',
      short_desc: 'Normalized display name',
    },
    status_text: {
      type: 'string',
      short_desc: 'Status text',
    },
    status_emoji: {
      type: 'string',
      short_desc: 'Status emoji',
    },
    email: {
      type: 'string',
      short_desc: 'Email address',
    },
    first_name: {
      type: 'string',
      short_desc: 'First name',
    },
    last_name: {
      type: 'string',
      short_desc: 'Last name',
    },
    avatar_hash: {
      type: 'string',
      short_desc: 'Avatar hash',
    },
    image_24: {
      type: 'string',
      short_desc: '24x24 avatar URL',
    },
    image_32: {
      type: 'string',
      short_desc: '32x32 avatar URL',
    },
    image_48: {
      type: 'string',
      short_desc: '48x48 avatar URL',
    },
    image_72: {
      type: 'string',
      short_desc: '72x72 avatar URL',
    },
    image_192: {
      type: 'string',
      short_desc: '192x192 avatar URL',
    },
    image_512: {
      type: 'string',
      short_desc: '512x512 avatar URL',
    },
    team: {
      type: 'string',
      short_desc: 'Team ID',
    },
  },
} satisfies TQoreResponseType;

/**
 * Slack user type
 */
export const SlackUserType = {
  type: 'hash',
  fields: {
    id: {
      type: 'string',
      short_desc: 'Unique identifier for the user',
    },
    name: {
      type: 'string',
      short_desc: 'Username',
    },
    team_id: {
      type: 'string',
      short_desc: 'Team ID',
    },
    deleted: {
      type: 'bool',
      short_desc: 'Whether the user is deleted',
    },
    color: {
      type: 'string',
      short_desc: 'User color',
    },
    real_name: {
      type: 'string',
      short_desc: 'Real name',
    },
    tz: {
      type: 'string',
      short_desc: 'Timezone',
    },
    tz_label: {
      type: 'string',
      short_desc: 'Timezone label',
    },
    tz_offset: {
      type: 'integer',
      short_desc: 'Timezone offset in seconds',
    },
    profile: { type: SlackUserProfileType },
    is_admin: {
      type: 'bool',
      short_desc: 'Whether the user is an admin',
    },
    is_owner: {
      type: 'bool',
      short_desc: 'Whether the user is an owner',
    },
    is_primary_owner: {
      type: 'bool',
      short_desc: 'Whether the user is the primary owner',
    },
    is_restricted: {
      type: 'bool',
      short_desc: 'Whether the user is restricted',
    },
    is_ultra_restricted: {
      type: 'bool',
      short_desc: 'Whether the user is ultra restricted',
    },
    is_bot: {
      type: 'bool',
      short_desc: 'Whether the user is a bot',
    },
    is_app_user: {
      type: 'bool',
      short_desc: 'Whether the user is an app user',
    },
    is_email_confirmed: {
      type: 'bool',
      short_desc: 'Whether the email is confirmed',
    },
    updated: {
      type: 'integer',
      short_desc: 'Unix timestamp when the user was last updated',
    },
  },
} satisfies TQoreResponseType;

/**
 * Find user by email response type
 */
export const SlackFindUserByEmailResponseType = {
  type: 'hash',
  fields: {
    ok: {
      type: 'bool',
      short_desc: 'Indicates if the user was found',
    },
    user: { type: SlackUserType },
  },
} satisfies TQoreResponseType;

/**
 * Update profile response type
 */
export const SlackUpdateProfileResponseType = {
  type: 'hash',
  fields: {
    ok: {
      type: 'bool',
      short_desc: 'Indicates if the profile was updated',
    },
    profile: { type: SlackUserProfileType },
  },
} satisfies TQoreResponseType;

/**
 * List users response type
 */
export const SlackListUsersResponseType = {
  type: 'hash',
  fields: {
    members: {
      type: {
        type: 'list',
        element_type: SlackUserType,
      },
      short_desc: 'List of users in the workspace',
    },
  },
} satisfies TQoreResponseType;

/**
 * Get user info response type
 */
export const SlackGetUserInfoResponseType = {
  type: 'hash',
  fields: {
    ok: {
      type: 'bool',
      short_desc: 'Indicates if the user was found',
    },
    user: { type: SlackUserType },
  },
} satisfies TQoreResponseType;

/**
 * TypeScript type for Slack user
 */
export type TSlackUser = {
  id: string;
  name: string;
  team_id?: string;
  deleted?: boolean;
  real_name?: string;
  tz?: string;
  tz_label?: string;
  tz_offset?: number;
  profile?: {
    title?: string;
    phone?: string;
    real_name?: string;
    display_name?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  is_admin?: boolean;
  is_owner?: boolean;
  is_bot?: boolean;
  is_app_user?: boolean;
};
