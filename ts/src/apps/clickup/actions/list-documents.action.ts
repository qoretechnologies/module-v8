import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { fetchClickUpData } from '../helpers/constants';
import { getClickUpSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';
import { getClickUpWorkspaceIdAllowedValues } from '../helpers/get-workspace-id-allowed-values';
import { getClickUpDocumentIdAllowedValues } from '../helpers/get-document-id-allowed-values';
import { getClickUpWorkspaceMemberIdAllowedValues } from '../helpers/get-workspace-member-id-allowed-values';

const options = {
  workspace: {
    type: 'string',
    required: true,
    preselected: true,
    on_change: ['refetch'],
    get_allowed_values: getClickUpWorkspaceIdAllowedValues,
  },
  creator: {
    required: false,
    type: 'number',
    get_allowed_values: getClickUpWorkspaceMemberIdAllowedValues,
  },
  deleted: {
    type: 'boolean',
    required: false,
  },
  archived: {
    type: 'boolean',
    required: false,
  },
  limit: {
    type: 'integer',
    required: false,
  },
  next_cursor: {
    type: 'string',
    required: false,
  },
  parent_id: {
    type: 'string',
    required: false,
    depends_on: ['parent_type'],
    allowed_values_creatable: true,
    get_allowed_values: (context) => {
      const parentType = context?.opts?.parent_type;

      if (!parentType) return getClickUpDocumentIdAllowedValues(context);
      else if (parentType === 'SPACE') return getClickUpSpaceIdAllowedValues(context);
      else if (parentType === 'WORKSPACE') return getClickUpWorkspaceIdAllowedValues(context);
      else return [];
    },
  },
  parent_type: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'SPACE', display_name: 'Space' },
      { value: 'FOLDER', display_name: 'Folder' },
      { value: 'LIST', display_name: 'List' },
      { value: 'EVERYTHING', display_name: 'Everything' },
      { value: 'WORKSPACE', display_name: 'Workspace' },
    ],
  },
} satisfies TQoreOptions;

const listDocuments = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CLICKUP_APP_NAME,
  action: 'list_documents',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, workspace } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['workspace'],
      ErrorClass: ClickUpError,
    });

    const {
      creator,
      archived,
      deleted,
      limit = 50,
      next_cursor,
      parent_id,
      parent_type,
    } = obj || {};

    try {
      return await fetchClickUpData({
        token,
        version: 'v3',
        params: {
          limit: limit.toString(),
          archived: archived === true ? 'true' : 'false',
          deleted: deleted === true ? 'true' : 'false',
          ...(next_cursor && { next_cursor }),
          ...(creator && { creator: creator.toString() }),
          ...(parent_id && { parent_id }),
          ...(parent_type && { parent_type }),
        },
        path: `workspaces/${workspace}/docs`,
      });
    } catch (error) {
      throw new ClickUpError(`Failed to list documents: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      docs: {
        type: {
          type: 'list',
          element_type: {
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
              public: { type: 'boolean' },
              workspace_id: { type: 'number' },
              creator: { type: 'number' },
              deleted: { type: 'boolean' },
              date_deleted: { type: 'number' },
              deleted_by: { type: 'number' },
              archived: { type: 'boolean' },
              date_archived: { type: 'number' },
              archived_by: { type: 'number' },
              type: { type: 'number' },
            },
          },
        },
      },
      next_cursor: { type: 'string' },
    },
  },
});

export default listDocuments;
