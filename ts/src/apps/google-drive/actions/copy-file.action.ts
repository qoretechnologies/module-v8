import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_DRIVE_APP_NAME, GoogleDriveError } from '../constants';
import { createGoogleDriveClient } from '../helpers/constants';
import { getGoogleDriveFileIdAllowedValues } from '../helpers/get-file-id-allowed-values';
import { getGoogleDriveFolderIdAllowedValues } from '../helpers/get-folder-id-allowed-values';

const options = {
  file_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleDriveFileIdAllowedValues,
  },
  new_name: {
    required: false,
    type: 'string',
  },
  convert_to_document: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
  folder_id: {
    required: false,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleDriveFolderIdAllowedValues,
  },
} satisfies TQoreOptions;

const copyGoogleDriveFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_DRIVE_APP_NAME,
  action: 'copy_file',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, file_id } = getQoreContextRequiredValues<{
      token: string;
      file_id: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['file_id'],
      connectionFields: ['token'],
      ErrorClass: GoogleDriveError,
    });

    const new_name = obj?.new_name;
    const convert_to_document = obj?.convert_to_document || false;
    const folder_id = obj?.folder_id;

    try {
      const driveClient = createGoogleDriveClient(token);

      const copyRequest = {
        fileId: file_id,
        requestBody: {
          name: new_name,
        },
        supportsAllDrives: true,
      };

      const copiedFile = await driveClient.files.copy(copyRequest);

      if (!copiedFile.data || !copiedFile.data.id) {
        throw new GoogleDriveError('Failed to copy file: No file data returned');
      }

      const fileId = copiedFile.data.id;

      if (folder_id) {
        const fileMetadata = await driveClient.files.get({
          fileId: fileId,
          fields: 'parents',
          supportsAllDrives: true,
        });

        await driveClient.files.update({
          fileId: fileId,
          addParents: folder_id,
          removeParents: fileMetadata.data.parents?.join(','),
          supportsAllDrives: true,
        });
      }

      if (convert_to_document) {
        const fileInfo = await driveClient.files.get({
          fileId: fileId,
          fields: 'mimeType',
          supportsAllDrives: true,
        });

        const mimeType = fileInfo.data.mimeType;

        if (mimeType && !mimeType.includes('google-apps')) {
          await driveClient.files.update({
            fileId: fileId,
            requestBody: {
              mimeType: 'application/vnd.google-apps.document',
            },
            supportsAllDrives: true,
          });
        }
      }

      const result = await driveClient.files.get({
        fileId: fileId,
        fields: 'id,name,mimeType,webViewLink,webContentLink',
        supportsAllDrives: true,
      });

      return {
        id: result.data.id,
        name: result.data.name,
        mime_type: result.data.mimeType,
        web_view_link: result.data.webViewLink,
        web_content_link: result.data.webContentLink,
        message: 'File copied successfully',
      };
    } catch (error) {
      throw new GoogleDriveError(`Failed to copy file: ${error.message || error}`);
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

export default copyGoogleDriveFile;
