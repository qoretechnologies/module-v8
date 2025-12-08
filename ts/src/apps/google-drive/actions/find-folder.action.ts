import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_DRIVE_APP_NAME, GoogleDriveError } from '../constants';
import { createGoogleDriveClient } from '../helpers/constants';
import { getGoogleDriveFolderIdAllowedValues } from '../helpers/get-folder-id-allowed-values';

const options = {
  folder_name: {
    required: true,
    type: 'string',
  },
  search_type: {
    required: false,
    type: 'string',
    default_value: 'contains',
    allowed_values: [
      { display_name: 'Contains', value: 'contains' },
      { display_name: 'Exact Match', value: 'exact' },
    ],
  },
  parent_folder: {
    required: false,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleDriveFolderIdAllowedValues,
  },
  create_if_not_exists: {
    required: false,
    type: 'bool',
    default_value: false,
  },
} satisfies TQoreOptions;

const findOrCreateFolder = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_DRIVE_APP_NAME,
  action: 'find_or_create_folder',
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

    try {
      const driveClient = createGoogleDriveClient(token);

      const queryParts = [];
      const searchType = obj?.search_type || 'contains';

      if (searchType === 'exact') {
        queryParts.push(`name = '${folder_name}'`);
      } else {
        queryParts.push(`name contains '${folder_name}'`);
      }

      queryParts.push(`mimeType = 'application/vnd.google-apps.folder'`);

      if (obj?.parent_folder) {
        queryParts.push(`'${obj.parent_folder}' in parents`);
      }

      const query = queryParts.join(' and ');

      const response = await driveClient.files.list({
        q: query,
        pageSize: 1,
        fields:
          'files(id, name, mimeType, webViewLink, modifiedTime, createdTime, parents, shared, webContentLink)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      if (response.data.files && response.data.files.length > 0) {
        const folder = response.data.files[0];

        return {
          found: true,
          created: false,
          folder: {
            id: folder.id,
            name: folder.name,
            web_view_link: folder.webViewLink,
            web_content_link: folder.webContentLink,
            modified_time: folder.modifiedTime,
            created_time: folder.createdTime,
            parents: folder.parents,
            shared: folder.shared,
          },
          message: `Folder "${folder.name}" found.`,
        };
      }

      const create_if_not_exists = obj?.create_if_not_exists || false;

      if (!create_if_not_exists) {
        return {
          found: false,
          created: false,
          message: `Folder "${folder_name}" not found.`,
        };
      }

      const parents = obj?.parent_folder ? [obj.parent_folder] : undefined;

      const createResponse = await driveClient.files.create({
        requestBody: {
          name: folder_name,
          mimeType: 'application/vnd.google-apps.folder',
          ...(parents && { parents }),
        },
        fields: 'id,name,mimeType,webViewLink,modifiedTime,createdTime,parents,shared',
        supportsAllDrives: true,
      });

      if (!createResponse.data || !createResponse.data.id) {
        throw new GoogleDriveError('Failed to create folder: No folder data returned');
      }

      const newFolder = createResponse.data;

      return {
        found: false,
        created: true,
        folder: {
          id: newFolder.id,
          name: newFolder.name,
          web_view_link: newFolder.webViewLink,
          web_content_link: newFolder.webContentLink,
          modified_time: newFolder.modifiedTime,
          created_time: newFolder.createdTime,
          parents: newFolder.parents,
          shared: newFolder.shared,
        },
        message: `Folder "${newFolder.name}" created successfully.`,
      };
    } catch (error) {
      throw new GoogleDriveError(`Failed to find or create folder: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      found: { type: 'bool' },
      created: { type: 'bool' },
      folder: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            name: { type: 'string' },
            web_view_link: { type: 'string' },
            web_content_link: { type: 'string' },
            modified_time: { type: 'string' },
            created_time: { type: 'string' },
            parents: {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
            shared: { type: 'bool' },
          },
        },
      },
      message: { type: 'string' },
    },
  },
});

export default findOrCreateFolder;
