import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_DRIVE_APP_NAME, GoogleDriveError } from '../constants';
import { createGoogleDriveClient } from '../helpers/constants';
import { getGoogleDriveFolderIdAllowedValues } from '../helpers/get-folder-id-allowed-values';

const options = {
  parent_folder_id: {
    required: false,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleDriveFolderIdAllowedValues,
  },
  folder_name: {
    required: true,
    type: 'string',
  },
} satisfies TQoreOptions;

const createFolder = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_DRIVE_APP_NAME,
  action: 'create_folder',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, folder_name } = getQoreContextRequiredValues<{
      token: string;
      folder_name: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['folder_name'],
      connectionFields: ['token'],
      ErrorClass: GoogleDriveError,
    });

    const parent_folder_id = obj?.parent_folder_id;

    try {
      const driveClient = createGoogleDriveClient(token);

      const folderMetadata = {
        name: folder_name,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parent_folder_id && { parents: [parent_folder_id] }),
      };

      const response = await driveClient.files.create({
        requestBody: folderMetadata,
        fields: 'id,name,mimeType,webViewLink,parents,webContentLink',
        supportsAllDrives: true,
      });

      if (!response.data || !response.data.id) {
        throw new GoogleDriveError('Failed to create folder: No folder data returned');
      }

      let parentFolderName = 'root';
      if (parent_folder_id) {
        try {
          const parentFolder = await driveClient.files.get({
            fileId: parent_folder_id,
            fields: 'name',
            supportsAllDrives: true,
          });
          parentFolderName = parentFolder.data.name || 'specified parent folder';
        } catch (error) {
          parentFolderName = `folder with ID ${parent_folder_id}`;
        }
      }

      return {
        id: response.data.id,
        name: response.data.name,
        web_view_link: response.data.webViewLink,
        parent_folder_id: parent_folder_id || 'root',
        message: `Folder "${response.data.name}" created successfully in ${parentFolderName}`,
      };
    } catch (error) {
      throw new GoogleDriveError(`Failed to create folder: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      name: { type: 'string' },
      web_view_link: { type: 'string' },
      parent_folder_id: { type: 'string' },
      message: { type: 'string' },
    },
  },
});

export default createFolder;
