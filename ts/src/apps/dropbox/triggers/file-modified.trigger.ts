import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollUpdatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { dropboxClient } from '../client';
import { DROPBOX_APP_NAME, DropboxError } from '../constants';
import { getDropboxFolderAllowedValues } from '../helpers/get-folder-allowed-values';
import { DropboxFileMetadataResponseType, TDropboxFileMetadata } from '../response-types';

const action = 'file_modified';

const options = {
  folder: {
    type: 'string',
    required: true,
    get_allowed_values: getDropboxFolderAllowedValues,
  },
} satisfies TQoreOptions;

/**
 * Fetch files from a folder, sorted by server_modified descending (most recently modified first)
 */
const fetchFilesForModificationTracking = async (
  token: string,
  folder: string
): Promise<TDropboxFileMetadata[]> => {
  try {
    const files = await dropboxClient.fetchWithCursor<TDropboxFileMetadata>({
      token,
      initialPath: 'files/list_folder',
      continuePath: 'files/list_folder/continue',
      initialBody: {
        path: folder,
        limit: 100,
      },
      filterTag: 'file',
      maxResults: DEFAULT_TRIGGER_POLL_ITEM_LIMIT * 2,
    });

    // Sort by server_modified descending (most recently modified first)
    files.sort(
      (a, b) => new Date(b.server_modified).getTime() - new Date(a.server_modified).getTime()
    );

    return files.slice(0, DEFAULT_TRIGGER_POLL_ITEM_LIMIT);
  } catch (error) {
    throw new DropboxError(`Failed to fetch files for modification tracking: ${error.message || error}`);
  }
};

const FileModified = QoreAppCreator.createLocalizedTrigger({
  app: DROPBOX_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, folder } = getQoreContextRequiredValues({
      context,
      optionFields: ['folder'],
      connectionFields: ['token'],
      ErrorClass: DropboxError,
    });

    const getItems = () => fetchFilesForModificationTracking(token, folder);

    await pollUpdatedItemsForTrigger({
      trigger_name: `dropbox_${action}`,
      uniqueField: 'id',
      updatedDateField: 'server_modified',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, folder } = getQoreContextRequiredValues({
      context,
      optionFields: ['folder'],
      connectionFields: ['token'],
      ErrorClass: DropboxError,
    });

    const files = await fetchFilesForModificationTracking(token, folder);

    return files?.length > 0 ? files[0] : null;
  },
  event_info: {
    desc: 'Dropbox File Modified Trigger Event Info',
    type: DropboxFileMetadataResponseType,
  },
});

export default FileModified;
