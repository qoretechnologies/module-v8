import {
  EQoreAppActionCode,
  IQoreAppActionWithFunction,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_DRIVE_APP_NAME, GoogleDriveError } from '../constants';
import { createGoogleDriveClient } from '../helpers/constants';
import { GoogleDriveExtensionAllowedValues } from '../helpers/file-extension-mapping';
import { GoogleDriveFileTypeAllowedValues } from '../helpers/file-search.helpers';
import { getGoogleDriveFolderIdAllowedValues } from '../helpers/get-folder-id-allowed-values';
import uploadFile from './upload-file.action';

const baseOptions = {
  filename: {
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
  create_if_not_exists: {
    required: false,
    type: 'bool',
    default_value: false,
    on_change: ['refetch'],
    get_dependent_options: (context) => {
      if (!context?.opts?.create_if_not_exists) return {} as TQoreOptions;

      return createFileOptions;
    },
  },
} satisfies TQoreOptions;

export const createFileOptions = {
  file: {
    required: true,
    type: 'file',
  },
  convert_to_document: {
    required: false,
    type: 'bool',
    default_value: false,
  },
  file_extension: {
    required: false,
    type: 'string',
    depends_on: ['file_name'],
    allowed_values_creatable: true,
    allowed_values: GoogleDriveExtensionAllowedValues,
  },
} satisfies TQoreOptions;

const findOrCreateFile = QoreAppCreator.createLocalizedAction<
  typeof baseOptions & Partial<typeof createFileOptions>
>({
  app: GOOGLE_DRIVE_APP_NAME,
  action: 'find_or_create_file',
  action_code: EQoreAppActionCode.ACTION,
  options: baseOptions,
  api_function: async (obj, _opts, context) => {
    const { token, filename } = getQoreContextRequiredValues<{
      token: string;
      filename: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['filename'],
      connectionFields: ['token'],
      ErrorClass: GoogleDriveError,
    });

    try {
      const driveClient = createGoogleDriveClient(token);

      const queryParts = [];
      const searchType = obj?.search_type || 'contains';

      if (searchType === 'exact') {
        queryParts.push(`name = '${filename}'`);
      } else {
        queryParts.push(`name contains '${filename}'`);
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

      if (!file_types.includes('application/vnd.google-apps.folder')) {
        queryParts.push(`mimeType != 'application/vnd.google-apps.folder'`);
      }

      const query = queryParts.join(' and ');

      const response = await driveClient.files.list({
        q: query,
        pageSize: 1,
        fields: '*',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      if (response.data.files && response.data.files.length > 0) {
        const file = response.data.files[0];

        const owners = file.owners
          ? file.owners.map((owner) => ({
              display_name: owner.displayName || '',
              email_address: owner.emailAddress || '',
              is_authenticated_user: owner.me || false,
              permission_id: owner.permissionId || '',
            }))
          : [];

        const exportLinks: Record<string, string> = {};
        if (file.exportLinks) {
          if (file.exportLinks['application/pdf'])
            exportLinks.pdf = file.exportLinks['application/pdf'];
          if (file.exportLinks['text/csv']) exportLinks.csv = file.exportLinks['text/csv'];
          if (file.exportLinks['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
            exportLinks.xlsx =
              file.exportLinks['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
          if (file.exportLinks['application/vnd.oasis.opendocument.spreadsheet'])
            exportLinks.ods = file.exportLinks['application/vnd.oasis.opendocument.spreadsheet'];
          if (file.exportLinks['text/tab-separated-values'])
            exportLinks.tsv = file.exportLinks['text/tab-separated-values'];
          if (file.exportLinks['application/zip'])
            exportLinks.zip = file.exportLinks['application/zip'];
        }

        return {
          found: true,
          created: false,
          file: {
            id: file.id,
            name: file.name,
            mime_type: file.mimeType,
            web_view_link: file.webViewLink,
            web_content_link: file.webContentLink,
            size: file.size,
            modified_time: file.modifiedTime,
            created_time: file.createdTime,
            parents: file.parents || [],
            shared: file.shared,
            is_folder: file.mimeType === 'application/vnd.google-apps.folder',
            title: file.name,
            owner_names: file.owners ? file.owners.map((owner) => owner.displayName) : [],
            last_modifying_user_name: file.lastModifyingUser?.displayName || '',
            spaces: file.spaces || [],
            kind: file.kind || '',
            owners,
            thumbnail_link: file.thumbnailLink || '',
            quota_bytes_used: file.quotaBytesUsed || file.size || '',
            version: file.version || '',
            export_links: exportLinks,
          },
          message: `File "${file.name}" found.`,
        };
      }
      const create_if_not_exists = obj?.create_if_not_exists || false;

      if (!create_if_not_exists) {
        return {
          found: false,
          created: false,
          message: `File "${filename}" not found.`,
        };
      }

      if (!obj?.file) {
        throw new GoogleDriveError('To create a file, you must provide file content.');
      }

      const uploadOptions = {
        folder: obj.folder,
        file: obj.file,
        convert_to_document: obj.convert_to_document,
        file_name: filename,
        file_extension: obj.file_extension,
      };

      const uploadFileAction = uploadFile as IQoreAppActionWithFunction;
      const uploadResult = await uploadFileAction.api_function(uploadOptions, _opts, context);

      return {
        found: false,
        created: true,
        file: {
          id: uploadResult.id,
          name: uploadResult.name,
          mime_type: uploadResult.mime_type,
          web_view_link: uploadResult.web_view_link,
          web_content_link: uploadResult.web_content_link,
          size: uploadResult.size,
          modified_time: uploadResult.last_modified,
          created_time: uploadResult.last_modified,
          parents: [],
          shared: false,
          is_folder: false,
          converted_to_document: uploadResult.converted_to_document,
          title: uploadResult.name,
          owner_names: [],
          last_modifying_user_name: '',
          spaces: ['drive'],
          kind: 'drive#file',
          owners: [],
          thumbnail_link: '',
          quota_bytes_used: uploadResult.size || '',
          version: '',
          export_links: {},
        },
        message: uploadResult.message,
      };
    } catch (error) {
      throw new GoogleDriveError(`Failed to find or create file: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      found: { type: 'bool' },
      created: { type: 'bool' },
      file: {
        type: {
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
            shared: { type: 'bool' },
            is_folder: { type: 'bool' },
            converted_to_document: { type: 'bool' },
            title: { type: 'string' },
            owner_names: {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
            last_modifying_user_name: { type: 'string' },
            spaces: {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
            kind: { type: 'string' },
            owners: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    display_name: { type: 'string' },
                    email_address: { type: 'string' },
                    is_authenticated_user: { type: 'bool' },
                    permission_id: { type: 'string' },
                    picture_url: { type: 'string' },
                  },
                },
              },
            },
            thumbnail_link: { type: 'string' },
            quota_bytes_used: { type: 'string' },
            version: { type: 'string' },
            export_links: {
              type: {
                type: 'hash',
                fields: {
                  pdf: { type: 'string' },
                  csv: { type: 'string' },
                  xlsx: { type: 'string' },
                  ods: { type: 'string' },
                  tsv: { type: 'string' },
                  zip: { type: 'string' },
                },
              },
            },
          },
        },
      },
      message: { type: 'string' },
    },
  },
});

export default findOrCreateFile;
