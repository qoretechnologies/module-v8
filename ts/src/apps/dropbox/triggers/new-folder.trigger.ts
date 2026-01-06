import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { dropboxClient } from '../client';
import { DROPBOX_APP_NAME, DropboxError } from '../constants';
import { getDropboxFolderAllowedValues } from '../helpers/get-folder-allowed-values';
import { DropboxFolderMetadataResponseType, TDropboxFolderMetadata } from '../response-types';

const action = 'new_folder';

const options = {
  parentFolder: {
    type: 'string',
    required: true,
    get_allowed_values: getDropboxFolderAllowedValues,
  },
} satisfies TQoreOptions;

/**
 * Fetch latest folders from a parent folder
 */
const fetchLatestFolders = async (
  token: string,
  parentFolder: string
): Promise<TDropboxFolderMetadata[]> => {
  try {
    const folders = await dropboxClient.fetchWithCursor<TDropboxFolderMetadata>({
      token,
      initialPath: 'files/list_folder',
      continuePath: 'files/list_folder/continue',
      initialBody: {
        path: parentFolder,
        limit: 100,
      },
      filterTag: 'folder',
      maxResults: DEFAULT_TRIGGER_POLL_ITEM_LIMIT * 2,
    });

    // Sort by name (folders don't have server_modified)
    folders.sort((a, b) => a.name.localeCompare(b.name));

    return folders.slice(0, DEFAULT_TRIGGER_POLL_ITEM_LIMIT);
  } catch (error) {
    throw new DropboxError(`Failed to fetch folders: ${error.message || error}`);
  }
};

const NewFolder = QoreAppCreator.createLocalizedTrigger({
  app: DROPBOX_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, parentFolder } = getQoreContextRequiredValues({
      context,
      optionFields: ['parentFolder'],
      connectionFields: ['token'],
      ErrorClass: DropboxError,
    });

    const getItems = () => fetchLatestFolders(token, parentFolder);

    await pollCreatedItemsForTrigger({
      trigger_name: `dropbox_${action}`,
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, parentFolder } = getQoreContextRequiredValues({
      context,
      optionFields: ['parentFolder'],
      connectionFields: ['token'],
      ErrorClass: DropboxError,
    });

    const folders = await fetchLatestFolders(token, parentFolder);

    return folders?.length > 0 ? folders[0] : null;
  },
  event_info: {
    desc: 'Dropbox New Folder Trigger Event Info',
    type: DropboxFolderMetadataResponseType,
  },
});

export default NewFolder;
