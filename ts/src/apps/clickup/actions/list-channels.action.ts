import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { map } from 'lodash';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { fetchClickUpData } from '../helpers/constants';
import { getClickUpWorkspaceIdAllowedValues } from '../helpers/get-workspace-id-allowed-values';

const options = {
  workspace: {
    type: 'string',
    required: true,
    preselected: true,
    get_allowed_values: getClickUpWorkspaceIdAllowedValues,
  },
  description_format: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'text/plain', display_name: 'Plain Text' },
      { value: 'text/md', display_name: 'Markdown' },
    ],
  },
  cursor: {
    type: 'string',
    required: false,
  },
  limit: {
    type: 'number',
    required: false,
    default_value: 50,
  },
  is_follower: {
    type: 'bool',
    required: false,
  },
  include_hidden: {
    type: 'bool',
    required: false,
  },

  room_types: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values: [
      { value: 'CHANNEL', display_name: 'Channel' },
      { value: 'DM', display_name: 'Direct Message' },
      { value: 'GROUP_DM', display_name: 'Group Direct Message' },
    ],
  },
} satisfies TQoreOptions;

const listChannels = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CLICKUP_APP_NAME,
  action: 'list_channels',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, workspace } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['workspace'],
      ErrorClass: ClickUpError,
    });

    const { cursor, limit, is_follower, include_hidden, room_types } = obj || {};

    try {
      return await fetchClickUpData({
        token,
        version: 'v3',
        params: {
          include_hidden: include_hidden === true ? 'true' : 'false',
          is_follower: is_follower === true ? 'true' : 'false',
          ...(cursor && { cursor }),
          ...(limit && { limit: limit.toString() }),
          ...(room_types && {
            room_types: map(room_types, (val) => `room_types=${encodeURIComponent(val)}`).join('&'),
          }),
        },
        path: `workspaces/${workspace}/chat/channels`,
      });
    } catch (error) {
      throw new ClickUpError(`Failed to list channels: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      next_cursor: { type: 'string' },
      data: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              topic: { type: 'string' },
              type: { type: 'string' },
              visibility: { type: 'string' },
              parent: {
                type: {
                  type: 'hash',
                  fields: {
                    id: { type: 'string' },
                    type: { type: 'number' },
                  },
                },
              },
              creator: { type: 'string' },
              created_at: { type: 'string' },
              workspace_id: { type: 'string' },
              archived: { type: 'bool' },
              latest_comment_at: { type: 'string' },
              is_canonical_channel: { type: 'bool' },
              is_hidden: { type: 'bool' },
              default_view: {
                type: {
                  type: 'hash',
                  fields: {
                    type: { type: 'number' },
                    view_id: { type: 'string' },
                    standard: { type: 'bool' },
                  },
                },
              },
              channel_type: { type: 'number' },
              counts: {
                type: {
                  type: 'hash',
                  fields: {
                    parent_id: { type: 'string' },
                    parent_type: { type: 'string' },
                    root_parent_id: { type: 'string' },
                    root_parent_type: { type: 'string' },
                    date: { type: 'number' },
                    version: { type: 'number' },
                    has_unread: { type: 'bool' },
                    num_unread: { type: 'number' },
                    latest_comment_at: { type: 'number' },
                    badge_count: { type: 'number' },
                    thread_count: { type: 'number' },
                    mention_count: { type: 'number' },
                  },
                },
              },
              chat_room_category: { type: 'string' },
              links: {
                type: {
                  type: 'hash',
                  fields: {
                    members: { type: 'string' },
                    followers: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

export default listChannels;
