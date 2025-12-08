import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_DRIVE_APP_NAME, GoogleDriveError } from '../constants';
import { createGoogleDriveClient } from '../helpers/constants';
import { getGoogleDriveFileIdAllowedValues } from '../helpers/get-file-id-allowed-values';

const options = {
  file_id: {
    required: true,
    get_allowed_values: getGoogleDriveFileIdAllowedValues,
    type: 'string',
  },
  include_content: {
    required: false,
    type: 'bool',
    default_value: false,
  },
  convert_export_format: {
    required: false,
    type: 'string',
    allowed_values: [
      { display_name: 'PDF', value: 'pdf' },
      { display_name: 'CSV', value: 'csv' },
      { display_name: 'Excel', value: 'xlsx' },
      { display_name: 'OpenDocument Spreadsheet', value: 'ods' },
      { display_name: 'TSV', value: 'tsv' },
      { display_name: 'ZIP', value: 'zip' },
      { display_name: 'Plain Text', value: 'txt' },
      { display_name: 'HTML', value: 'html' },
    ],
  },
} satisfies TQoreOptions;

const getFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_DRIVE_APP_NAME,
  action: 'get_file',
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

    const include_content = obj?.include_content || false;
    const convert_export_format = obj?.convert_export_format;

    try {
      const driveClient = createGoogleDriveClient(token);

      const fileResponse = await driveClient.files.get({
        fileId: file_id,
        fields: '*',
        supportsAllDrives: true,
      });

      if (!fileResponse.data) {
        throw new GoogleDriveError(`File with ID "${file_id}" not found.`);
      }

      const file = fileResponse.data;

      const owners = file.owners
        ? file.owners.map((owner) => ({
            display_name: owner.displayName || '',
            email_address: owner.emailAddress || '',
            is_authenticated_user: owner.me || false,
            permission_id: owner.permissionId || '',
            picture_url: owner.photoLink || '',
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
        if (file.exportLinks['text/plain']) exportLinks.txt = file.exportLinks['text/plain'];
        if (file.exportLinks['text/html']) exportLinks.html = file.exportLinks['text/html'];
      }

      let content = null;
      let content_as_text = null;
      let exported_content = null;

      if (include_content) {
        try {
          if (file.mimeType?.includes('google-apps') && convert_export_format) {
            const exportMimeTypes: Record<string, string> = {
              pdf: 'application/pdf',
              csv: 'text/csv',
              xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              ods: 'application/vnd.oasis.opendocument.spreadsheet',
              tsv: 'text/tab-separated-values',
              zip: 'application/zip',
              txt: 'text/plain',
              html: 'text/html',
            };

            const mimeType = exportMimeTypes[convert_export_format];

            console.log('Exporting file with mimeType:', mimeType);

            if (mimeType) {
              const exportResponse = await driveClient.files.export(
                {
                  fileId: file_id,
                  mimeType,
                },
                { responseType: 'arraybuffer' }
              );

              exported_content = Buffer.from(exportResponse.data as string).toString('base64');
            }
          } else {
            const contentResponse = await driveClient.files.get(
              {
                fileId: file_id,
                alt: 'media',
              },
              { responseType: 'arraybuffer' }
            );

            content = Buffer.from(contentResponse.data as string).toString('base64');

            if (
              file.mimeType?.includes('text/') ||
              file.mimeType?.includes('json') ||
              file.mimeType?.includes('xml') ||
              file.mimeType?.includes('javascript')
            ) {
              try {
                content_as_text = Buffer.from(contentResponse.data as string).toString('utf-8');
              } catch (e) {}
            }
          }
        } catch (error) {
          console.error(`Could not retrieve file content: ${error.message}`);
        }
      }

      const capabilities = {
        can_edit: file.capabilities?.canEdit || false,
        can_comment: file.capabilities?.canComment || false,
        can_share: file.capabilities?.canShare || false,
        can_copy: file.capabilities?.canCopy || false,
        can_delete: file.capabilities?.canDelete || false,
        can_download: file.capabilities?.canDownload || false,
        can_rename: file.capabilities?.canRename || false,
        can_move: file.capabilities?.canMoveItemIntoTeamDrive || false,
      };

      return {
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
        is_google_doc: file.mimeType?.includes('google-apps'),
        trashed: file.trashed,
        description: file.description || '',
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
        content: content,
        content_as_text: content_as_text,
        exported_content: exported_content,
        exported_format: exported_content ? convert_export_format : null,
        capabilities,
        md5_checksum: file.md5Checksum || '',
        full_file_extension: file.fullFileExtension || '',
        icon_link: file.iconLink || '',
        original_filename: file.originalFilename || file.name,
        starred: file.starred || false,
        viewed_by_me_time: file.viewedByMeTime || '',
      };
    } catch (error) {
      throw new GoogleDriveError(`Failed to get file: ${error.message || error}`);
    }
  },
  response_type: {
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
      is_google_doc: { type: 'bool' },
      trashed: { type: 'bool' },
      description: { type: 'string' },
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
            txt: { type: 'string' },
            html: { type: 'string' },
          },
        },
      },
      content: { type: 'string' },
      content_as_text: { type: 'string' },
      exported_content: { type: 'string' },
      exported_format: { type: 'string' },
      capabilities: {
        type: {
          type: 'hash',
          fields: {
            can_edit: { type: 'bool' },
            can_comment: { type: 'bool' },
            can_share: { type: 'bool' },
            can_copy: { type: 'bool' },
            can_delete: { type: 'bool' },
            can_download: { type: 'bool' },
            can_rename: { type: 'bool' },
            can_move: { type: 'bool' },
          },
        },
      },
      md5_checksum: { type: 'string' },
      full_file_extension: { type: 'string' },
      icon_link: { type: 'string' },
      original_filename: { type: 'string' },
      starred: { type: 'bool' },
      viewed_by_me_time: { type: 'string' },
    },
  },
});

export default getFile;
