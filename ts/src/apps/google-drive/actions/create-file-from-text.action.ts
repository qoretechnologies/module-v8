import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_DRIVE_APP_NAME, GoogleDriveError } from '../constants';
import { createGoogleDriveClient } from '../helpers/constants';
import { getGoogleDriveFolderIdAllowedValues } from '../helpers/get-folder-id-allowed-values';
import { Readable } from 'stream';

const options = {
  folder_id: {
    required: false,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleDriveFolderIdAllowedValues,
  },
  file_name: {
    required: true,
    type: 'string',
  },
  file_content: {
    required: true,
    type: 'string',
  },
  convert_to_document: {
    required: false,
    type: 'bool',
    default_value: false,
  },
} satisfies TQoreOptions;

const createFileFromText = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_DRIVE_APP_NAME,
  action: 'create_file_from_text',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, file_name, file_content } = getQoreContextRequiredValues<{
      token: string;
      file_name: string;
      file_content: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['file_name', 'file_content'],
      connectionFields: ['token'],
      ErrorClass: GoogleDriveError,
    });

    const folder_id = obj?.folder_id;
    const convert_to_document = obj?.convert_to_document || false;

    try {
      const driveClient = createGoogleDriveClient(token);

      const mimeType = convert_to_document ? 'application/vnd.google-apps.document' : 'text/plain';

      const fileMetadata = {
        name: file_name,
        mimeType: mimeType,
        ...(folder_id && { parents: [folder_id] }),
      };

      const contentStream = Readable.from([file_content]);

      const response = await driveClient.files.create({
        requestBody: fileMetadata,
        media: {
          mimeType: 'text/plain',
          body: contentStream,
        },
        fields: 'id,name,mimeType,webViewLink,webContentLink',
        supportsAllDrives: true,
      });

      if (!response.data || !response.data.id) {
        throw new GoogleDriveError('Failed to create file: No file data returned');
      }

      return {
        id: response.data.id,
        name: response.data.name,
        mime_type: response.data.mimeType,
        web_view_link: response.data.webViewLink,
        web_content_link: response.data.webContentLink,
        message: `File "${response.data.name}" created successfully`,
      };
    } catch (error) {
      throw new GoogleDriveError(`Failed to create file from text: ${error.message || error}`);
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
      message: { type: 'string' },
    },
  },
});

export default createFileFromText;
