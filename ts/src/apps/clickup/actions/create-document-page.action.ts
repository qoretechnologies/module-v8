import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { clickUpClient } from '../client';
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
    required: true,
    type: 'string',
    get_allowed_values: getClickUpDocumentIdAllowedValues,
  },
  name: {
    type: 'string',
    required: false,
    preselected: true,
  },
  content: {
    type: 'string',
    required: false,
  },
  sub_title: {
    type: 'string',
    required: false,
  },
  content_format: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'text/md', display_name: 'Markdown' },
      {
        value: 'text/plain',
        display_name: 'Plain Text',
      },
    ],
  },
} satisfies TQoreOptions;

const createDocumentPage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CLICKUP_APP_NAME,
  action: 'create_document_page',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, workspace, document } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['workspace', 'document'],
      ErrorClass: ClickUpError,
    });

    const { name, content, content_format, sub_title } = obj || {};

    try {
      return await clickUpClient.post(
        clickUpClient.v3(`workspaces/${workspace}/docs/${document}/pages`),
        {
          ...(name && { name }),
          ...(content && { content }),
          ...(content_format && { content_format }),
          ...(sub_title && { sub_title }),
        },
        { token }
      );
    } catch (error) {
      throw new ClickUpError(`Failed to create document page: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      doc_id: { type: 'string' },
      parent_page_id: { type: 'string' },
      workspace_id: { type: 'number' },
      name: { type: 'string' },
      pages: {
        type: {
          type: 'list',
          element_type: 'hash',
        },
      },
      sub_title: { type: 'string' },
      date_created: { type: 'number' },
      date_updated: { type: 'number' },
      content: { type: 'string' },
      avatar: {
        type: {
          type: 'hash',
          fields: {
            color: { type: 'string' },
            value: { type: 'string' },
            source: { type: 'string' },
          },
        },
      },
      creator_id: { type: 'number' },
      deleted: { type: 'bool' },
      deleted_by: { type: 'number' },
      date_deleted: { type: 'number' },
      date_edited: { type: 'number' },
      edited_by: { type: 'number' },
      archived: { type: 'bool' },
      archived_by: { type: 'number' },
      date_archived: { type: 'number' },
      authors: {
        type: {
          type: 'list',
          element_type: 'number',
        },
      },
      contributors: {
        type: {
          type: 'list',
          element_type: 'number',
        },
      },
      cover: {
        type: {
          type: 'hash',
          fields: {
            color: { type: 'string' },
            image_url: { type: 'string' },
            position: {
              type: {
                type: 'hash',
                fields: {
                  x: { type: 'number' },
                  y: { type: 'number' },
                },
              },
            },
          },
        },
      },
      protected: { type: 'bool' },
      protected_by: { type: 'number' },
      protected_note: { type: 'string' },
      presentation_details: {
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

export default createDocumentPage;
