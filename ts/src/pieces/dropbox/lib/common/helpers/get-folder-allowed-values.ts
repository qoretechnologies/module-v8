import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../../../utils/Debugger';
import { DROPBOX_ALLOWED_VALUES_TIMEOUT } from '../constants';

type TDropboxItem = {
  path_lower: string;
  path_display: string;
  name: string;
  '.tag': 'folder' | 'file';
};

const getFoldersInitial = async (
  token: string,
  path: string
): Promise<{ has_more: boolean; cursor: string; folders: TDropboxItem[] }> => {
  const { data } = await QorusRequest.post<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: '/2/files/list_folder',
      data: {
        path,
        recursive: true,
        limit: 100,
      },
    },
    { url: 'https://api.dropboxapi.com', endpointId: 'Dropbox' }
  );

  return {
    has_more: data.has_more,
    cursor: data.cursor,
    folders: data.entries.filter((entry: TDropboxItem) => entry['.tag'] === 'folder'),
  };
};

const getFoldersContinue = async (
  token: string,
  cursor: string
): Promise<{ has_more: boolean; cursor: string; folders: TDropboxItem[] }> => {
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
    folders: data.entries.filter((entry: TDropboxItem) => entry['.tag'] === 'folder'),
  };
};

const mapDropboxFolder = (folder: TDropboxItem): IQoreAllowedValue => ({
  value: folder.path_lower,
  display_name: folder.name,
  short_desc: folder.path_display,
});

export const getDropboxFolderAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('The token is required to get Dropbox folder allowed values');
  }

  const folders: IQoreAllowedValue[] = [{ value: '', display_name: 'Root', short_desc: '/' }];
  const startTime = Date.now();

  try {
    const initialFolders = await getFoldersInitial(token, '');

    folders.push(...initialFolders.folders.map(mapDropboxFolder));

    let cursor = initialFolders.cursor;
    let hasMore = initialFolders.has_more;

    while (hasMore) {
      const continueFolders = await getFoldersContinue(token, cursor);
      hasMore = continueFolders.has_more;
      cursor = continueFolders.cursor;

      folders.push(...continueFolders.folders.map(mapDropboxFolder));

      if (Date.now() - startTime > DROPBOX_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log('Timeout fetching Dropbox folders');
        break;
      }
    }

    return folders;
  } catch (error) {
    Debugger.log(`Error fetching Dropbox folders: ${error}`);

    return folders;
  }
};
