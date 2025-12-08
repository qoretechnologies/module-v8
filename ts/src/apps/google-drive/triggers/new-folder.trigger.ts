import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { GOOGLE_DRIVE_APP_NAME, GoogleDriveError } from '../constants';
import { createGoogleDriveClient } from '../helpers/constants';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getGoogleDriveFolderIdAllowedValues } from '../helpers/get-folder-id-allowed-values';

const GoogleDriveNewFolderTrigger = QoreAppCreator.createLocalizedTrigger({
  app: GOOGLE_DRIVE_APP_NAME,
  action: 'new_folder',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    folder_name: {
      type: 'string',
      required: false,
    },
    folder_id: {
      type: 'string',
      required: false,
      get_allowed_values: getGoogleDriveFolderIdAllowedValues,
    },
    search_type: {
      type: 'string',
      required: false,
      default_value: 'contains',
      allowed_values: [
        { display_name: 'Contains', value: 'contains' },
        { display_name: 'Exact Match', value: 'exact' },
      ],
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: GoogleDriveError,
    });

    const folder_name = context.opts?.folder_name;
    const parent_folder_id = context.opts?.folder_id;
    const search_type = context.opts?.search_type || 'contains';

    const getItems = () => {
      return fetchLatestFolders(token, {
        folderName: folder_name,
        parentFolderId: parent_folder_id,
        search_type,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'google_drive_new_folder',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: GoogleDriveError,
    });

    const folder_name = context.opts?.folder_name;
    const parent_folder_id = context.opts?.folder_id;
    const search_type = context.opts?.search_type || 'contains';

    const folders = await fetchLatestFolders(token, {
      folderName: folder_name,
      parentFolderId: parent_folder_id,
      search_type,
    });

    if (folders?.length > 0) {
      return folders[0];
    }

    return null;
  },
  event_info: {
    desc: 'Google Drive New Folder Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        name: { type: 'string' },
        web_view_link: { type: 'string' },
        created_time: { type: 'string' },
        modified_time: { type: 'string' },
        parents: {
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
        shared: { type: 'bool' },
        trashed: { type: 'bool' },
        description: { type: 'string' },
        owner_names: {
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
        last_modifying_user_name: { type: 'string' },
        timestamp: { type: 'string' },
      },
    },
  },
});

const fetchLatestFolders = async (
  token: string,
  options: {
    folderName?: string;
    parentFolderId?: string;
    search_type?: string;
  }
) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  try {
    const driveClient = createGoogleDriveClient(token);

    const queryParts = [`trashed = false`, `mimeType = 'application/vnd.google-apps.folder'`];

    if (options.parentFolderId) {
      queryParts.push(`'${options.parentFolderId}' in parents`);
    }

    if (options.folderName) {
      if (options.search_type === 'exact') {
        queryParts.push(`name = '${options.folderName}'`);
      } else {
        queryParts.push(`name contains '${options.folderName}'`);
      }
    }

    const query = queryParts.join(' and ');

    const response = await driveClient.files.list({
      q: query,
      pageSize: limit,
      fields: '*',
      orderBy: 'createdTime desc',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const folders = response.data.files || [];

    return folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      web_view_link: folder.webViewLink,
      created_time: folder.createdTime,
      modified_time: folder.modifiedTime,
      parents: folder.parents || [],
      shared: folder.shared,
      trashed: folder.trashed,
      description: folder.description || '',
      owner_names: folder.owners ? folder.owners.map((owner) => owner.displayName) : [],
      last_modifying_user_name: folder.lastModifyingUser?.displayName || '',
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    throw new GoogleDriveError(`Failed to fetch latest folders: ${error.message || error}`);
  }
};

export default GoogleDriveNewFolderTrigger;
