import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { clickUpClient } from '../client';
import { getClickUpGroupIdAllowedValues } from '../helpers/get-group-id-allowed-values';
import { getClickUpWorkspaceIdAllowedValues } from '../helpers/get-workspace-id-allowed-values';

const options = {
  workspace: {
    type: 'string',
    required: true,
    preselected: true,
    on_change: ['refetch'],
    get_allowed_values: getClickUpWorkspaceIdAllowedValues,
  },
  group_ids: {
    type: 'string',
    get_allowed_values: getClickUpGroupIdAllowedValues,
    allowed_values_creatable: true,
  },
} satisfies TQoreOptions;

const listGroups = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CLICKUP_APP_NAME,
  action: 'list_groups',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, workspace } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['workspace'],
      ErrorClass: ClickUpError,
    });

    const { group_ids } = obj || {};

    try {
      return await clickUpClient.get('group', {
        token,
        params: {
          workspace,
          ...(group_ids && { group_ids }),
        },
      });
    } catch (error) {
      throw new ClickUpError(`Failed to list groups: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      groups: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              team_id: { type: 'string' },
              userid: { type: 'number' },
              name: { type: 'string' },
              handle: { type: 'string' },
              date_created: { type: 'string' },
              metadata: { type: 'string' },
              description: { type: 'string' },
              bookmarks: { type: 'string' },
              description_visibility: { type: 'string' },
              bookmarks_visibility: { type: 'string' },
              initials: { type: 'string' },
              description_size: { type: 'string' },
              members: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      id: { type: 'number' },
                      username: { type: 'string' },
                      email: { type: 'string' },
                      color: { type: 'string' },
                      initials: { type: 'string' },
                      profilePicture: { type: 'string' },
                    },
                  },
                },
              },
              avatar: {
                type: {
                  type: 'hash',
                  fields: {
                    attachment: {
                      type: {
                        type: 'hash',
                        fields: {
                          id: { type: 'string' },
                          date: { type: 'string' },
                          title: { type: 'string' },
                          type: { type: 'number' },
                          source: { type: 'number' },
                          version: { type: 'number' },
                          extension: { type: 'string' },
                          thumbnail_small: { type: 'string' },
                          thumbnail_medium: { type: 'string' },
                          thumbnail_large: { type: 'string' },
                          is_folder: { type: 'string' },
                          mimetype: { type: 'string' },
                          hidden: { type: 'bool' },
                          parent_id: { type: 'string' },
                          size: { type: 'number' },
                          total_comments: { type: 'number' },
                          resolved_comments: { type: 'number' },
                          user: {
                            type: {
                              type: 'hash',
                              fields: {
                                id: { type: 'number' },
                                username: { type: 'string' },
                                email: { type: 'string' },
                                initials: { type: 'string' },
                                color: { type: 'string' },
                                profilePicture: { type: 'string' },
                              },
                            },
                          },
                          deleted: { type: 'bool' },
                          orientation: { type: 'string' },
                          url: { type: 'string' },
                          parent_comment_type: { type: 'string' },
                          parent_comment_parent: { type: 'string' },
                          email_data: { type: 'string' },
                          workspace_id: { type: 'number' },
                          url_w_query: { type: 'string' },
                          url_w_host: { type: 'string' },
                        },
                      },
                    },
                    attachment_id: { type: 'string' },
                    color: { type: 'string' },
                    source: { type: 'string' },
                    icon: { type: 'string' },
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

export default listGroups;
