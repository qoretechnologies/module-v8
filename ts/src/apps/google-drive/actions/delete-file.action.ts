import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_DRIVE_APP_NAME, GoogleDriveError } from '../constants';
import { createGoogleDriveClient } from '../helpers/constants';
import { getGoogleDriveFileIdAllowedValues } from '../helpers/get-file-id-allowed-values';

const options = {
  file_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleDriveFileIdAllowedValues,
  },
  permanently_delete: {
    required: false,
    type: 'bool',
    default_value: false,
  },
} satisfies TQoreOptions;

const deleteFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_DRIVE_APP_NAME,
  action: 'delete_file',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, file_id } = getQoreContextRequiredValues<{
      token: string;
      file_id: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['file_id'],
      connectionFields: ['token'],
      ErrorClass: GoogleDriveError,
    });

    const permanently_delete = obj?.permanently_delete || false;

    try {
      const driveClient = createGoogleDriveClient(token);

      const fileInfo = await driveClient.files.get({
        fileId: file_id,
        fields: 'name,trashed',
        supportsAllDrives: true,
      });

      const fileName = fileInfo.data.name || 'Unknown file';
      const isAlreadyTrashed = fileInfo.data.trashed || false;

      if (isAlreadyTrashed && permanently_delete) {
        await driveClient.files.delete({
          fileId: file_id,
          supportsAllDrives: true,
        });

        return {
          success: true,
          file_id,
          file_name: fileName,
          message: `File "${fileName}" has been permanently deleted.`,
        };
      }

      if (permanently_delete) {
        await driveClient.files.delete({
          fileId: file_id,
          supportsAllDrives: true,
        });

        return {
          success: true,
          file_id,
          file_name: fileName,
          message: `File "${fileName}" has been permanently deleted.`,
        };
      }

      await driveClient.files.update({
        fileId: file_id,
        requestBody: {
          trashed: true,
        },
        supportsAllDrives: true,
      });

      return {
        success: true,
        file_id,
        file_name: fileName,
        message: `File "${fileName}" has been moved to trash.`,
      };
    } catch (error) {
      throw new GoogleDriveError(`Failed to delete file: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
      file_id: { type: 'string' },
      file_name: { type: 'string' },
      message: { type: 'string' },
    },
  },
});

export default deleteFile;
