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
  folder_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleDriveFolderIdAllowedValues,
  },
  shortcut_name: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const createShortcut = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_DRIVE_APP_NAME,
  action: 'create_shortcut',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, file_id, folder_id } = getQoreContextRequiredValues<{
      token: string;
      file_id: string;
      folder_id: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['file_id', 'folder_id'],
      connectionFields: ['token'],
      ErrorClass: GoogleDriveError,
    });

    const shortcut_name = obj?.shortcut_name;

    try {
      const driveClient = createGoogleDriveClient(token);

      const fileInfo = await driveClient.files.get({
        fileId: file_id,
        fields: 'name,mimeType',
        supportsAllDrives: true,
      });

      const fileName = fileInfo.data.name || 'Unknown file';

      const folderInfo = await driveClient.files.get({
        fileId: folder_id,
        fields: 'name',
        supportsAllDrives: true,
      });

      const folderName = folderInfo.data.name || 'Unknown folder';

      const shortcutMetadata = {
        name: shortcut_name || fileName,
        mimeType: 'application/vnd.google-apps.shortcut',
        parents: [folder_id],
        shortcutDetails: {
          targetId: file_id,
        },
      };

      const response = await driveClient.files.create({
        requestBody: shortcutMetadata,
        fields: 'id,name,webViewLink,shortcutDetails,webContentLink',
        supportsAllDrives: true,
      });

      if (!response.data || !response.data.id) {
        throw new GoogleDriveError('Failed to create shortcut: No shortcut data returned');
      }

      return {
        id: response.data.id,
        name: response.data.name,
        web_view_link: response.data.webViewLink,
        target_file_id: file_id,
        target_file_name: fileName,
        folder_id: folder_id,
        folder_name: folderName,
        message: `Shortcut "${response.data.name}" to "${fileName}" created successfully in folder "${folderName}"`,
      };
    } catch (error) {
      throw new GoogleDriveError(`Failed to create shortcut: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      name: { type: 'string' },
      web_view_link: { type: 'string' },
      target_file_id: { type: 'string' },
      target_file_name: { type: 'string' },
      folder_id: { type: 'string' },
      folder_name: { type: 'string' },
      message: { type: 'string' },
    },
  },
});

export default createShortcut;
