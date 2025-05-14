import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_DRIVE_APP_NAME, GoogleDriveError } from '../constants';
import { createGoogleDriveClient } from '../helpers/constants';
import { getGoogleDriveFolderIdAllowedValues } from '../helpers/get-folder-id-allowed-values';
import {
  GoogleDriveFileTypeAllowedValues,
  GoogleDriveOrderByAllowedValues,
  GoogleDriveOrderByDirectionAllowedValues,
  GoogleDriveOrderByFieldAllowedValues,
} from '../helpers/file-search.helpers';

const options = {
  filename: {
    required: false,
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
  folder: {
    required: false,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleDriveFolderIdAllowedValues,
  },
  file_types: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values_creatable: true,
    element_allowed_values: GoogleDriveFileTypeAllowedValues,
  },
  order_by: {
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          field: {
            type: 'string',
            required: true,
            allowed_values_creatable: true,
            allowed_values: GoogleDriveOrderByFieldAllowedValues,
          },
          direction: {
            type: 'string',
            required: true,
            allowed_values_creatable: true,
            allowed_values: GoogleDriveOrderByDirectionAllowedValues,
          },
        },
      },
    },
    element_allowed_values_creatable: true,
    element_allowed_values: GoogleDriveOrderByAllowedValues,
  },
  page_size: {
    required: false,
    type: 'integer',
    default_value: 100,
  },
  custom_query: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const listFiles = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_DRIVE_APP_NAME,
  action: 'list_files',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues<{ token: string }>({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: GoogleDriveError,
    });

    const orderBy = (obj?.order_by as { field: string; direction: string }[] | undefined)
      ?.map((item) => `${item.field} ${item.direction}`)
      .join(',');
    const pageSize = obj?.page_size || 100;
    const customQuery = obj?.custom_query || '';

    const queryParts = [];

    if (obj?.filename) {
      const searchType = obj?.search_type || 'contains';
      if (searchType === 'exact') {
        queryParts.push(`name = '${obj.filename}'`);
      } else {
        queryParts.push(`name contains '${obj.filename}'`);
      }
    }

    if (obj?.folder) {
      queryParts.push(`'${obj.folder}' in parents`);
    }

    const file_types: string[] = obj?.file_types || [];

    if (file_types.length > 0) {
      const mimeTypeQueries = file_types.map((type) => {
        return type.endsWith('/') ? `mimeType contains '${type}'` : `mimeType = '${type}'`;
      });

      if (mimeTypeQueries.length === 1) {
        queryParts.push(mimeTypeQueries[0]);
      } else {
        queryParts.push(`(${mimeTypeQueries.join(' or ')})`);
      }
    }

    if (customQuery) {
      queryParts.push(`(${customQuery})`);
    }

    const query = queryParts.length > 0 ? queryParts.join(' and ') : '';

    try {
      const driveClient = createGoogleDriveClient(token);

      const response = await driveClient.files.list({
        q: query,
        pageSize,
        ...(orderBy && { orderBy }),
        fields:
          'files(id, name, mimeType, webViewLink, size, modifiedTime, createdTime, parents, shared, webContentLink)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      if (!response.data || !response.data.files) {
        return { files: [] };
      }

      return {
        files: response.data.files.map((file) => ({
          id: file.id,
          name: file.name,
          mime_type: file.mimeType,
          web_view_link: file.webViewLink,
          web_content_link: file.webContentLink,
          size: file.size,
          modified_time: file.modifiedTime,
          created_time: file.createdTime,
          parents: file.parents,
          shared: file.shared,
          is_folder: file.mimeType === 'application/vnd.google-apps.folder',
        })),
      };
    } catch (error) {
      throw new GoogleDriveError(`Failed to list files: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      files: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              name: { type: 'string' },
              mime_type: { type: 'string' },
              web_view_link: { type: 'string' },
              web_content_link: { type: 'string' },
              size: { type: 'string' },
              modified_time: { type: 'string' },
              created_time: { type: 'string' },
              parents: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              shared: { type: 'boolean' },
              is_folder: { type: 'boolean' },
            },
          },
        },
      },
    },
  },
});

export default listFiles;
