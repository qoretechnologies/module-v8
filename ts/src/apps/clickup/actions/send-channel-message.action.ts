import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { fetchClickUpData } from '../helpers/constants';
import { getClickUpChannelIdAllowedValues } from '../helpers/get-channel-id-allowed-values';
import { getClickUpGroupIdAllowedValues } from '../helpers/get-group-id-allowed-values';
import { getClickUpWorkspaceIdAllowedValues } from '../helpers/get-workspace-id-allowed-values';
import { getClickUpWorkspaceMemberIdAllowedValues } from '../helpers/get-workspace-member-id-allowed-values';

const options = {
  workspace: {
    type: 'string',
    required: true,
    preselected: true,
    get_allowed_values: getClickUpWorkspaceIdAllowedValues,
  },
  channel: {
    type: 'string',
    required: true,
    get_allowed_values: getClickUpChannelIdAllowedValues,
  },
  assignee: {
    type: 'number',
    required: false,
    get_allowed_values: getClickUpWorkspaceMemberIdAllowedValues,
  },
  group_assignee: {
    type: 'string',
    required: false,
    get_allowed_values: getClickUpGroupIdAllowedValues,
  },
  type: {
    type: 'string',
    required: true,
    default_value: 'message',
    allowed_values: [
      { value: 'message', display_name: 'Message' },
      { value: 'post', display_name: 'Post' },
    ],
  },
  content: {
    type: 'string',
    required: true,
  },
  followers: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
    get_element_allowed_values: getClickUpWorkspaceMemberIdAllowedValues,
  },
  content_format: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'text/plain', display_name: 'Plain Text' },
      { value: 'text/md', display_name: 'Markdown' },
    ],
  },
} satisfies TQoreOptions;

const sendChannelMessage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CLICKUP_APP_NAME,
  action: 'send_channel_message',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, workspace, channel, content, type } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['workspace', 'channel', 'content', 'type'],
      ErrorClass: ClickUpError,
    });

    const { assignee, group_assignee, followers, content_format } = obj || {};

    try {
      return await fetchClickUpData({
        token,
        version: 'v3',
        method: 'POST',
        body: {
          content,
          type,
          ...(assignee && { assignee }),
          ...(group_assignee && { group_assignee }),
          ...(followers && { followers }),
          ...(content_format && { content_format }),
        },
        path: `workspaces/${workspace}/chat/channels/${channel}/messages`,
      });
    } catch (error) {
      throw new ClickUpError(`Failed to send message: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      post_data: {
        type: {
          type: 'hash',
          fields: {
            title: { type: 'string' },
            subtype: {
              type: {
                type: 'hash',
                fields: {
                  id: { type: 'string' },
                },
              },
            },
          },
        },
      },
      assignee: { type: 'string' },
      assigned_by: { type: 'string' },
      content: { type: 'string' },
      date: { type: 'number' },
      date_assigned: { type: 'number' },
      date_resolved: { type: 'number' },
      date_updated: { type: 'number' },
      group_assignee: { type: 'string' },
      id: { type: 'string' },
      parent_channel: { type: 'string' },
      parent_message: { type: 'string' },
      resolved: { type: 'boolean' },
      resolved_by: { type: 'string' },
      triaged_action: { type: 'number' },
      triaged_object_id: { type: 'string' },
      triaged_object_type: { type: 'number' },
      type: { type: 'string' },
      user_id: { type: 'string' },
      links: {
        type: {
          type: 'hash',
          fields: {
            reactions: { type: 'string' },
            replies: { type: 'string' },
            tagged_users: { type: 'string' },
          },
        },
      },
      replies_count: { type: 'number' },
    },
  },
});

export default sendChannelMessage;
