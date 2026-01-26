import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreFile,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { Readable } from 'stream';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_DRIVE_APP_NAME, GoogleDriveError } from '../constants';
import { createGoogleDriveClient } from '../helpers/constants';
import { GOOGLE_DRIVE_EXTENSION_MIME_MAP } from '../helpers/file-extension-mapping';
import { getGoogleDriveFileIdAllowedValues } from '../helpers/get-file-id-allowed-values';

const options = {
  file_to_replace: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleDriveFileIdAllowedValues,
  },
  file: {
    required: true,
    type: 'file',
  },
  file_name: {
    required: false,
    type: 'string',
  },
  file_extension: {
    required: false,
    type: 'string',
    depends_on: ['file_name'],
    allowed_values_creatable: true,
    allowed_values: [
      {
        value: 'docx',
        display_name: 'Word Document',
      },
      {
        value: 'xlsx',
        display_name: 'Excel Spreadsheet',
      },
      {
        value: 'pptx',
        display_name: 'PowerPoint Presentation',
      },
      {
        value: 'pdf',
        display_name: 'PDF Document',
      },
      {
        value: 'txt',
        display_name: 'Text File',
      },
    ],
  },
} satisfies TQoreOptions;

const replaceFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_DRIVE_APP_NAME,
  action: 'replace_file',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, file_to_replace, file } = getQoreContextRequiredValues<{
      token: string;
      file_to_replace: string;
      file: TQoreFile;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['file_to_replace', 'file'],
      connectionFields: ['token'],
      ErrorClass: GoogleDriveError,
    });

    const file_extension = obj?.file_extension || file.name.split('.').pop() || '';

    let file_name = obj?.file_name || file.name;
    if (obj?.file_extension) {
      const nameWithoutExtension = file_name.includes('.')
        ? file_name.substring(0, file_name.lastIndexOf('.'))
        : file_name;

      file_name = `${nameWithoutExtension}.${file_extension}`;
    }

    try {
      const driveClient = createGoogleDriveClient(token);

      const originalFileInfo = await driveClient.files.get({
        fileId: file_to_replace,
        fields: 'name,mimeType',
        supportsAllDrives: true,
      });

      const originalFileName = originalFileInfo.data.name || 'Unknown file';

      let mimeType = file.mime_type;

      if (obj?.file_extension && GOOGLE_DRIVE_EXTENSION_MIME_MAP[file_extension.toLowerCase()]) {
        mimeType = GOOGLE_DRIVE_EXTENSION_MIME_MAP[file_extension.toLowerCase()];
      }

      const file_content = Buffer.from(file.content, 'base64');
      const contentStream = Readable.from([file_content]);

      const response = await driveClient.files.update({
        fileId: file_to_replace,
        media: {
          mimeType: file.mime_type,
          body: contentStream,
        },
        requestBody: {
          name: file_name,
          mimeType: mimeType,
        },
        fields: 'id,name,mimeType,webViewLink,size,modifiedTime,webContentLink',
        supportsAllDrives: true,
      });

      if (!response.data || !response.data.id) {
        throw new GoogleDriveError('Failed to replace file: No file data returned');
      }

      return {
        id: response.data.id,
        name: response.data.name,
        mime_type: response.data.mimeType,
        extension: file_extension,
        web_view_link: response.data.webViewLink,
        web_content_link: response.data.webContentLink,
        size: response.data.size,
        last_modified: response.data.modifiedTime,
        original_file_name: originalFileName,
        message: `File "${originalFileName}" has been replaced with "${response.data.name}" successfully`,
      };
    } catch (error) {
      throw new GoogleDriveError(`Failed to replace file: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      name: { type: 'string' },
      mime_type: { type: 'string' },
      extension: { type: 'string' },
      web_view_link: { type: 'string' },
      web_content_link: { type: 'string' },
      size: { type: 'string' },
      last_modified: { type: 'string' },
      original_file_name: { type: 'string' },
      converted_to_document: { type: 'bool' },
      message: { type: 'string' },
    },
  },
});

export default replaceFile;
