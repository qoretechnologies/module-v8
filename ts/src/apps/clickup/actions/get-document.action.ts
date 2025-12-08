import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { fetchClickUpData } from '../helpers/constants';
import { getClickUpDocumentIdAllowedValues } from '../helpers/get-document-id-allowed-values';
import { getClickUpWorkspaceIdAllowedValues } from '../helpers/get-workspace-id-allowed-values';

const options = {
  workspace: {
    type: 'string',
    required: true,
    on_change: ['refetch'],
    preselected: true,
    get_allowed_values: getClickUpWorkspaceIdAllowedValues,
  },
  document: {
    type: 'string',
    required: true,
    get_allowed_values: getClickUpDocumentIdAllowedValues,
  },
} satisfies TQoreOptions;

const getDocument = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CLICKUP_APP_NAME,
  action: 'get_document',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, workspace, document } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['workspace', 'document'],
      ErrorClass: ClickUpError,
    });

    try {
      return await fetchClickUpData({
        token,
        version: 'v3',
        path: `workspaces/${workspace}/docs/${document}`,
      });
    } catch (error) {
      throw new ClickUpError(`Failed to get document: ${error}`);
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

export default getDocument;
