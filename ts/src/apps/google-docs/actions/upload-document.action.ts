import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreFile,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { Readable } from 'stream';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { createGoogleDriveClient } from '../../google-drive/helpers/constants';
import { getGoogleDriveFolderIdAllowedValues } from '../../google-drive/helpers/get-folder-id-allowed-values';
import { GOOGLE_DOCS_APP_NAME, GoogleDocsError } from '../constants';

const options = {
  folder: {
    required: false,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleDriveFolderIdAllowedValues,
  },
  file: {
    required: true,
    type: 'file',
  },
  file_name: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const uploadDocument = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_DOCS_APP_NAME,
  action: 'upload_document',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, file } = getQoreContextRequiredValues<{
      token: string;
      file: TQoreFile;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['file'],
      connectionFields: ['token'],
      ErrorClass: GoogleDocsError,
    });

    const folder = obj?.folder;

    const file_name = obj?.file_name || file.name;

    try {
      const driveClient = createGoogleDriveClient(token);

      const mimeType = file.mime_type;

      const file_content = Buffer.from(file.content, 'base64');
      const contentStream = Readable.from([file_content]);

      const uploadMimeType = 'application/vnd.google-apps.document';

      const response = await driveClient.files.create({
        requestBody: {
          name: file_name,
          mimeType: uploadMimeType,
          ...(folder && { parents: [folder] }),
        },
        media: {
          mimeType,
          body: contentStream,
        },
        fields: '*',
        supportsAllDrives: true,
      });

      if (!response.data || !response.data.id) {
        throw new GoogleDocsError('Failed to upload file: No file data returned');
      }

      return {
        id: response.data.id,
        name: response.data.name,
        mime_type: response.data.mimeType,
        web_view_link: response.data.webViewLink,
        web_content_link: response.data.webContentLink,
        size: response.data.size,
        last_modified: response.data.modifiedTime,
      };
    } catch (error) {
      throw new GoogleDocsError(`Failed to upload file: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      name: { type: 'string' },
      mime_type: { type: 'string' },
      web_view_link: { type: 'string' },
      web_content_link: { type: 'string' },
      size: { type: 'string' },
      last_modified: { type: 'string' },
    },
  },
});

export default uploadDocument;
