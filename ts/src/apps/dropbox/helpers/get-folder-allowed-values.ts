import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { dropboxClient } from '../client';
import { DropboxError, extractDropboxErrorMessage } from '../constants';
import { TDropboxFolderMetadata } from '../response-types';
import { DROPBOX_ALLOWED_VALUES_TIMEOUT } from './constants';

/**
 * Maps a Dropbox folder to an allowed value
 */
const mapFolderToAllowedValue = (folder: TDropboxFolderMetadata): IQoreAllowedValue<string> => ({
  value: folder.path_lower,
  display_name: folder.name,
  short_desc: folder.path_display,
});

/**
 * Get Dropbox folder allowed values for dropdown selection
 *
 * Fetches all folders recursively from the user's Dropbox,
 * with timeout protection to prevent long-running requests.
 */
export const getDropboxFolderAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new DropboxError('Token is required to get Dropbox folder allowed values');
  }

  // Start with root folder option
  const allowedValues: IQoreAllowedValue<string>[] = [
    { value: '', display_name: 'Root', short_desc: '/' },
  ];

  try {
    const folders = await dropboxClient.fetchWithCursor<TDropboxFolderMetadata>({
      token,
      initialPath: 'files/list_folder',
      continuePath: 'files/list_folder/continue',
      initialBody: {
        path: '',
        recursive: true,
        limit: 100,
      },
      filterTag: 'folder',
      timeout: DROPBOX_ALLOWED_VALUES_TIMEOUT,
    });

    allowedValues.push(...folders.map(mapFolderToAllowedValue));

    return allowedValues;
  } catch (error) {
    if (error instanceof DropboxError) {
      throw error;
    }

    throw new DropboxError(
      `Failed to fetch Dropbox folder allowed values: ${extractDropboxErrorMessage(error)}`
    );
  }
};
