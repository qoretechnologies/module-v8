import { drive_v3 } from '@googleapis/drive';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { Readable } from 'stream';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { createGoogleDriveClient } from '../../google-drive/helpers/constants';
import { getGoogleDriveFolderIdAllowedValues } from '../../google-drive/helpers/get-folder-id-allowed-values';
import { GOOGLE_DOCS_APP_NAME, GoogleDocsError } from '../constants';
import { exportGoogleDocsDocument } from '../helpers/export-document.helper';
import { googleDocsExportFormatAllowedValues } from '../helpers/export-format-allowed-values';

const options = {
  document_name: {
    type: 'string',
    required: true,
  },
  document_content: {
    type: 'string',
    required: true,
  },
  parse_html: {
    type: 'bool',
    required: false,
    default_value: true,
    preselected: true,
  },
  folder_id: {
    type: 'string',
    required: false,
    get_allowed_values: getGoogleDriveFolderIdAllowedValues,
  },
  export_format: {
    type: 'string',
    required: false,
    allowed_values: googleDocsExportFormatAllowedValues,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    document_id: {
      type: 'string',
    },
    document_name: {
      type: 'string',
    },
    document_url: {
      type: 'string',
    },
    created_at: {
      type: 'string',
    },
    success: {
      type: 'bool',
    },
    message: {
      type: 'string',
    },
    exported_file: {
      type: {
        type: 'hash',
        fields: {
          file_id: {
            type: 'string',
          },
          file_name: {
            type: 'string',
          },
          file_url: {
            type: 'string',
          },
          format: {
            type: 'string',
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;

export const createDocumentFromText = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_DOCS_APP_NAME,
  action: 'create_document_from_text',
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type,
  api_function: async (data, _opts, context) => {
    const { token, document_name, document_content } = getQoreContextRequiredValues({
      context: { ...context, opts: data },
      optionFields: ['document_name', 'document_content'],
      connectionFields: ['token'],
      ErrorClass: GoogleDocsError,
    });

    const folder_id = data?.folder_id;
    const export_format = data?.export_format;
    const parse_html = data?.parse_html === true;

    try {
      const driveClient = createGoogleDriveClient(token);

      const createRequestBody: drive_v3.Schema$File = {
        name: document_name,
        mimeType: 'application/vnd.google-apps.document',
        ...(folder_id && { parents: [folder_id] }),
      };

      const contentStream = Readable.from([document_content]);

      const createResponse = await driveClient.files.create({
        requestBody: createRequestBody,
        media: {
          mimeType: parse_html ? 'text/html' : 'text/plain',
          body: contentStream,
        },
        fields: 'id,name,webViewLink,createdTime',
      });

      if (!createResponse.data.id) {
        throw new GoogleDocsError('Failed to create document');
      }

      const documentId = createResponse.data.id;
      const documentUrl =
        createResponse.data.webViewLink || `https://docs.google.com/document/d/${documentId}/edit`;
      const createdAt = createResponse.data.createdTime || new Date().toISOString();

      let exportedFile = null;
      if (export_format) {
        try {
          exportedFile = await exportGoogleDocsDocument(
            driveClient,
            documentId,
            document_name,
            export_format,
            folder_id
          );
        } catch (error) {
          console.error('Export failed:', error);
        }
      }

      const messageParts = [`Successfully created document "${document_name}"`];
      if (exportedFile) {
        messageParts.push(`and exported as ${export_format}`);
      }

      return {
        document_id: documentId,
        document_name,
        document_url: documentUrl,
        created_at: createdAt,
        success: true,
        message: messageParts.join(' '),
        ...(exportedFile ? { exported_file: exportedFile } : {}),
      };
    } catch (error: any) {
      if (error instanceof GoogleDocsError) {
        throw error;
      }

      if (error.response?.data?.error) {
        const apiError = error.response.data.error;
        throw new GoogleDocsError(
          `Google API error: ${apiError.message || 'Unknown error'} (Code: ${apiError.code || 'unknown'})`
        );
      }

      throw new GoogleDocsError(`Failed to create document: ${error.message || 'Unknown error'}`);
    }
  },
});

export default createDocumentFromText;
