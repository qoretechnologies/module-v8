import {
  EQoreAppActionCode,
  QorusRequest,
  TQorePartialEventAction,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../../utils/Debugger';
import { getDropboxFolderAllowedValues } from '../common/helpers/get-folder-allowed-values';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../../global/constants';
import { pollCreatedItemsForTrigger } from '../../../../global/helpers/event-triggers';

type TDropboxFile = {
  '.tag': 'file';
  name: string;
  path_lower: string;
  path_display: string;
  id: string;
  client_modified: string;
  server_modified: string;
  rev: string;
  size: number;
  is_downloadable: boolean;
  content_hash: string;
};

const getFilesInitial = async (
  token: string,
  path: string
): Promise<{ has_more: boolean; cursor: string; files: TDropboxFile[] }> => {
  const { data } = await QorusRequest.post<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: '/2/files/list_folder',
      data: {
        path,
        limit: 100,
      },
    },
    { url: 'https://api.dropboxapi.com', endpointId: 'Dropbox' }
  );

  return {
    has_more: data.has_more,
    cursor: data.cursor,
    files: data.entries.filter((entry: TDropboxFile) => entry['.tag'] === 'file'),
  };
};

const getFilesContinue = async (
  token: string,
  cursor: string
): Promise<{ has_more: boolean; cursor: string; files: TDropboxFile[] }> => {
  const { data } = await QorusRequest.post<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: '/2/files/list_folder/continue',
      data: {
        cursor,
      },
    },
    { url: 'https://api.dropboxapi.com', endpointId: 'Dropbox' }
  );

  return {
    has_more: data.has_more,
    cursor: data.cursor,
    files: data.entries.filter((entry: TDropboxFile) => entry['.tag'] === 'file'),
  };
};

const getLastModifiedFiles = async (token: string, folder: string): Promise<TDropboxFile[]> => {
  const files: TDropboxFile[] = [];

  try {
    const initialFiles = await getFilesInitial(token, folder);
    files.push(...initialFiles.files);

    let cursor = initialFiles.cursor;
    let hasMore = initialFiles.has_more;

    while (hasMore) {
      const continueFolders = await getFilesContinue(token, cursor);
      hasMore = continueFolders.has_more;
      cursor = continueFolders.cursor;

      files.push(...continueFolders.files);
    }
  } catch (error) {
    Debugger.log(`Error fetching Dropbox folders: ${error}`);
  }

  files.sort(
    (a, b) => new Date(b.server_modified).getTime() - new Date(a.server_modified).getTime()
  );

  return files.slice(0, DEFAULT_TRIGGER_POLL_ITEM_LIMIT);
};

export default {
  action: 'new_file_in_folder',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    folder: {
      required: true,
      get_allowed_values: getDropboxFolderAllowedValues,
      type: 'string',
    },
  },
  event_function: async (context, update, should_stop) => {
    const token = context?.conn_opts?.token;
    const folder = context?.opts?.folder;

    if (!token || !folder) {
      throw new Error(
        'The token and folder options are required to start the new_file_in_folder event_function'
      );
    }

    const getFiles = () => {
      return getLastModifiedFiles(token, folder);
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'dropbox_new_file_in_folder',
      uniqueField: 'id',
      getItems: getFiles,
      update,
      should_stop,
    });
  },
  event_info: {
    desc: 'Notion New Database Item Event Info',
    type: {
      type: 'hash',
      fields: {
        '.tag': {
          type: 'string',
        },
        name: {
          type: 'string',
        },
        path_lower: {
          type: 'string',
        },
        path_display: {
          type: 'string',
        },
        id: {
          type: 'string',
        },
        client_modified: {
          type: 'string',
        },
        server_modified: {
          type: 'string',
        },
        rev: {
          type: 'string',
        },
        size: {
          type: 'number',
        },
        is_downloadable: {
          type: 'boolean',
        },
        content_hash: {
          type: 'string',
        },
      },
    },
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const folder = context?.opts?.folder;

    if (!token || !folder) {
      throw new Error(
        'The token and folder options are required to get the example event data for Dropbox new file in folder trigger'
      );
    }

    const latestItems = await getLastModifiedFiles(token, folder);

    return latestItems?.length > 0 ? latestItems[0] : null;
  },
} satisfies TQorePartialEventAction;
