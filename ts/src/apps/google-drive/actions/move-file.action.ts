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
} satisfies TQoreOptions;

const moveFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_DRIVE_APP_NAME,
  action: 'move_file',
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

    try {
      const driveClient = createGoogleDriveClient(token);

      const fileInfo = await driveClient.files.get({
        fileId: file_id,
        fields: 'name,parents',
        supportsAllDrives: true,
      });

      const fileName = fileInfo.data.name || 'Unknown file';
      const currentParents = fileInfo.data.parents?.join(',') || '';

      const folderInfo = await driveClient.files.get({
        fileId: folder_id,
        fields: 'name',
        supportsAllDrives: true,
      });

      const folderName = folderInfo.data.name || 'Unknown folder';

      const response = await driveClient.files.update({
        fileId: file_id,
        addParents: folder_id,
        removeParents: currentParents,
        fields: 'id,name,parents,webViewLink,webContentLink',
        supportsAllDrives: true,
      });

      if (!response.data || !response.data.id) {
        throw new GoogleDriveError('Failed to move file: No file data returned');
      }

      return {
        id: file_id,
        name: fileName,
        web_view_link: response.data.webViewLink,
        web_content_link: response.data.webContentLink,
        destination_folder_id: folder_id,
        destination_folder_name: folderName,
        message: `File "${fileName}" moved to folder "${folderName}" successfully`,
      };
    } catch (error) {
      throw new GoogleDriveError(`Failed to move file: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      name: { type: 'string' },
      web_view_link: { type: 'string' },
      web_content_link: { type: 'string' },
      destination_folder_id: { type: 'string' },
      destination_folder_name: { type: 'string' },
      message: { type: 'string' },
    },
  },
});

export default moveFile;
