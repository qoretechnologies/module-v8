import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { fetchClickUpData } from '../helpers/constants';
import { getClickUpSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';
import { getClickUpWorkspaceIdAllowedValues } from '../helpers/get-workspace-id-allowed-values';

const options = {
  workspace: {
    type: 'string',
    required: true,
    on_change: ['refetch'],
    preselected: true,
    get_allowed_values: getClickUpWorkspaceIdAllowedValues,
  },
  name: {
    type: 'string',
    required: false,
    preselected: true,
  },
  parent: {
    required: false,
    get_dynamic_type: (context) => {
      const parentType = context?.opts?.parent?.type;

      if (parentType === 'SPACE') {
        return {
          type: 'hash',
          fields: {
            id: {
              type: 'string',
              required: true,
              get_allowed_values: getClickUpSpaceIdAllowedValues,
            },
            type: { type: 'number', default_value: 4 },
          },
        };
      } else if (parentType === 'WORKSPACE') {
        return {
          type: 'hash',
          fields: {
            id: {
              type: 'string',
              required: true,
              get_allowed_values: getClickUpWorkspaceIdAllowedValues,
            },
            type: { type: 'number', default_value: 12 },
          },
        };
      } else {
        return {
          type: 'hash',
          fields: {
            id: { type: 'string', required: true },
            type: { type: 'number', default_value: parentType },
          },
        };
      }
    },
    on_change: ['refetch'],
    type: {
      type: 'hash',
      fields: {
        type: {
          type: 'number',
          allowed_values: [
            { value: 4, display_name: 'Space' },
            { value: 5, display_name: 'Folder' },
            { value: 6, display_name: 'List' },
            { value: 7, display_name: 'Everything' },
            { value: 12, display_name: 'Workspace' },
          ],
        },
      },
    },
  },
  visibility: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'PUBLIC', display_name: 'Public' },
      { value: 'PRIVATE', display_name: 'Private' },
    ],
  },
  create_page: {
    type: 'bool',
    required: false,
  },
} satisfies TQoreOptions;

const createDocument = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CLICKUP_APP_NAME,
  action: 'create_document',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, workspace } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['workspace'],
      ErrorClass: ClickUpError,
    });

    const { name, parent, visibility, create_page } = obj || {};

    try {
      return await fetchClickUpData({
        token,
        version: 'v3',
        method: 'POST',
        path: `workspaces/${workspace}/docs`,
        body: {
          ...(name && { name }),
          ...(parent && { parent }),
          ...(visibility && { visibility }),
          ...(create_page && { create_page }),
        },
      });
    } catch (error) {
      throw new ClickUpError(`Failed to create document: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      date_created: { type: 'number' },
      date_updated: { type: 'number' },
      name: { type: 'string' },
      parent: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            type: { type: 'number' },
          },
        },
      },
      public: { type: 'bool' },
      workspace_id: { type: 'number' },
      archived: { type: 'bool' },
      archived_by: { type: 'number' },
      creator: { type: 'number' },
      date_archived: { type: 'number' },
      date_deleted: { type: 'number' },
      deleted: { type: 'bool' },
      deleted_by: { type: 'number' },
      page_defaults: {
        type: {
          type: 'hash',
          fields: {
            font: { type: 'string' },
            font_size: { type: 'number' },
            line_height: { type: 'number' },
            page_width: { type: 'number' },
            paragraph_spacing: { type: 'number' },
            show_author_header: { type: 'bool' },
            show_contributor_header: { type: 'bool' },
            show_cover_header: { type: 'bool' },
            show_date_header: { type: 'bool' },
            show_page_outline: { type: 'bool' },
            show_sub_pages: { type: 'bool' },
            sub_page_size: { type: 'string' },
            show_sub_title_header: { type: 'bool' },
            show_title_icon_header: { type: 'bool' },
            show_relationships: { type: 'bool' },
            show_relationships_compact: { type: 'bool' },
            show_sub_pages_author: { type: 'bool' },
            show_sub_pages_thumbnail: { type: 'bool' },
            show_sub_pages_compact: { type: 'bool' },
            sub_pages_style: { type: 'string' },
          },
        },
      },
    },
  },
});

export default createDocument;
