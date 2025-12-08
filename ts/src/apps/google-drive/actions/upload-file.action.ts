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
import {
  GOOGLE_DRIVE_DOC_MIME_MAPPINGS,
  GOOGLE_DRIVE_EXTENSION_MIME_MAP,
} from '../helpers/file-extension-mapping';
import { getGoogleDriveFolderIdAllowedValues } from '../helpers/get-folder-id-allowed-values';

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
  convert_to_document: {
    required: false,
    type: 'bool',
    default_value: false,
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
    allowed_values: Object.keys(GOOGLE_DRIVE_EXTENSION_MIME_MAP).map((ext) => ({
      value: ext,
      display_name: ext.toUpperCase(),
    })),
  },
} satisfies TQoreOptions;

const uploadFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_DRIVE_APP_NAME,
  action: 'upload_file',
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
      ErrorClass: GoogleDriveError,
    });

    const convert_to_document = obj?.convert_to_document || false;
    const file_extension = obj?.file_extension || file.name.split('.').pop() || '';
    const folder = obj?.folder;

    let file_name = obj?.file_name || file.name;
    if (obj?.file_extension) {
      const nameWithoutExtension = file_name.includes('.')
        ? file_name.substring(0, file_name.lastIndexOf('.'))
        : file_name;

      file_name = `${nameWithoutExtension}.${file_extension}`;
    }

    try {
      const driveClient = createGoogleDriveClient(token);

      let mimeType = file.mime_type;
      if (file_extension && GOOGLE_DRIVE_EXTENSION_MIME_MAP[file_extension.toLowerCase()]) {
        mimeType = GOOGLE_DRIVE_EXTENSION_MIME_MAP[file_extension.toLowerCase()];
      }

      const file_content = Buffer.from(file.content, 'base64');
      const contentStream = Readable.from([file_content]);

      let convertible = false;
      let uploadMimeType = mimeType;

      if (convert_to_document && GOOGLE_DRIVE_DOC_MIME_MAPPINGS[mimeType]) {
        uploadMimeType = GOOGLE_DRIVE_DOC_MIME_MAPPINGS[mimeType];
        convertible = true;
      }

      const response = await driveClient.files.create({
        requestBody: {
          name: file_name,
          mimeType: uploadMimeType,
          ...(folder && { parents: [folder] }),
        },
        media: {
          mimeType: mimeType,
          body: contentStream,
        },
        fields: '*',
        supportsAllDrives: true,
      });

      if (!response.data || !response.data.id) {
        throw new GoogleDriveError('Failed to upload file: No file data returned');
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
        converted_to_document: convertible && convert_to_document,
        message: `File "${response.data.name}" has been uploaded successfully${
          convertible && convert_to_document ? ' and converted to Google format' : ''
        }`,
      };
    } catch (error) {
      throw new GoogleDriveError(`Failed to upload file: ${error.message || error}`);
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
      converted_to_document: { type: 'bool' },
      message: { type: 'string' },
    },
  },
});

export default uploadFile;
