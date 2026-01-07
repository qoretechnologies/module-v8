import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { dropboxClient } from '../client';
import { DropboxError, extractDropboxErrorMessage } from '../constants';
import { TDropboxFileMetadata } from '../response-types';
import { DROPBOX_ALLOWED_VALUES_TIMEOUT } from './constants';

/**
 * Maps a Dropbox file to an allowed value
 */
const mapFileToAllowedValue = (file: TDropboxFileMetadata): IQoreAllowedValue<string> => ({
  value: file.path_lower,
  display_name: file.name,
  short_desc: file.path_display,
});

/**
 * Get Dropbox file allowed values for dropdown selection
 *
 * Fetches all files recursively from the user's Dropbox,
 * with timeout protection to prevent long-running requests.
 */
export const getDropboxFileAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new DropboxError('Token is required to get Dropbox file allowed values');
  }

  try {
    const files = await dropboxClient.fetchWithCursor<TDropboxFileMetadata>({
      token,
      initialPath: 'files/list_folder',
      continuePath: 'files/list_folder/continue',
      initialBody: {
        path: '',
        recursive: true,
        limit: 100,
      },
      filterTag: 'file',
      timeout: DROPBOX_ALLOWED_VALUES_TIMEOUT,
    });

    return files.map(mapFileToAllowedValue);
  } catch (error) {
    if (error instanceof DropboxError) {
      throw error;
    }

    throw new DropboxError(
      `Failed to fetch Dropbox file allowed values: ${extractDropboxErrorMessage(error)}`
    );
  }
};
