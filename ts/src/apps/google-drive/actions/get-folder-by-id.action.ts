import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_DRIVE_APP_NAME, GoogleDriveError } from '../constants';
import { createGoogleDriveClient } from '../helpers/constants';
import { getGoogleDriveFolderIdAllowedValues } from '../helpers/get-folder-id-allowed-values';

const options = {
  folder_id: {
    required: true,
    get_allowed_values: getGoogleDriveFolderIdAllowedValues,
    type: 'string',
  },
  include_children: {
    required: false,
    type: 'bool',
    default_value: false,
  },
  children_limit: {
    required: false,
    type: 'number',
    default_value: 100,
  },
} satisfies TQoreOptions;

const getFolder = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_DRIVE_APP_NAME,
  action: 'get_folder',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, folder_id } = getQoreContextRequiredValues<{
      token: string;
      folder_id: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['folder_id'],
      connectionFields: ['token'],
      ErrorClass: GoogleDriveError,
    });

    const include_children = obj?.include_children || false;
    const children_limit = obj?.children_limit || 100;

    try {
      const driveClient = createGoogleDriveClient(token);

      const folderResponse = await driveClient.files.get({
        fileId: folder_id,
        fields: '*',
        supportsAllDrives: true,
      });

      if (!folderResponse.data) {
        throw new GoogleDriveError(`Folder with ID "${folder_id}" not found.`);
      }

      const folder = folderResponse.data;

      if (folder.mimeType !== 'application/vnd.google-apps.folder') {
        throw new GoogleDriveError(`The ID "${folder_id}" points to a file, not a folder.`);
      }

      const owners = folder.owners
        ? folder.owners.map((owner) => ({
            display_name: owner.displayName || '',
            email_address: owner.emailAddress || '',
            is_authenticated_user: owner.me || false,
            permission_id: owner.permissionId || '',
            picture_url: owner.photoLink || '',
          }))
        : [];

      let children: Record<string, any> = [];
      if (include_children) {
        const childrenResponse = await driveClient.files.list({
          q: `'${folder_id}' in parents and trashed = false`,
          pageSize: children_limit,
          fields:
            'files(id, name, mimeType, size, modifiedTime, createdTime, webViewLink, webContentLink, owners, shared)',
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        });

        if (childrenResponse.data.files && childrenResponse.data.files.length > 0) {
          children = childrenResponse.data.files.map((file) => ({
            id: file.id,
            name: file.name,
            mime_type: file.mimeType,
            is_folder: file.mimeType === 'application/vnd.google-apps.folder',
            web_view_link: file.webViewLink,
            web_content_link: file.webContentLink,
            size: file.size,
            modified_time: file.modifiedTime,
            created_time: file.createdTime,
            shared: file.shared,
            owner_names: file.owners ? file.owners.map((owner) => owner.displayName) : [],
          }));
        }
      }

      const capabilities = {
        can_edit: folder.capabilities?.canEdit || false,
        can_comment: folder.capabilities?.canComment || false,
        can_share: folder.capabilities?.canShare || false,
        can_copy: folder.capabilities?.canCopy || false,
        can_delete: folder.capabilities?.canDelete || false,
        can_download: folder.capabilities?.canDownload || false,
        can_rename: folder.capabilities?.canRename || false,
        can_move: folder.capabilities?.canMoveItemIntoTeamDrive || false,
        can_add_children: folder.capabilities?.canAddChildren || false,
        can_remove_children: folder.capabilities?.canRemoveChildren || false,
      };

      return {
        id: folder.id,
        name: folder.name,
        mime_type: folder.mimeType,
        web_view_link: folder.webViewLink,
        parents: folder.parents || [],
        shared: folder.shared,
        trashed: folder.trashed,
        description: folder.description || '',
        title: folder.name,
        modified_time: folder.modifiedTime,
        created_time: folder.createdTime,
        owner_names: folder.owners ? folder.owners.map((owner) => owner.displayName) : [],
        last_modifying_user_name: folder.lastModifyingUser?.displayName || '',
        spaces: folder.spaces || [],
        kind: folder.kind || '',
        owners,
        children_count: children.length,
        children: children,
        has_more_children: children.length >= children_limit,
        capabilities,
        color_rgb: folder.folderColorRgb || '',
        viewed_by_me_time: folder.viewedByMeTime || '',
        starred: folder.starred || false,
      };
    } catch (error) {
      throw new GoogleDriveError(`Failed to get folder: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      name: { type: 'string' },
      mime_type: { type: 'string' },
      web_view_link: { type: 'string' },
      parents: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      shared: { type: 'bool' },
      trashed: { type: 'bool' },
      description: { type: 'string' },
      title: { type: 'string' },
      modified_time: { type: 'string' },
      created_time: { type: 'string' },
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
      children_count: { type: 'number' },
      children: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              name: { type: 'string' },
              mime_type: { type: 'string' },
              is_folder: { type: 'bool' },
              web_view_link: { type: 'string' },
              web_content_link: { type: 'string' },
              size: { type: 'string' },
              modified_time: { type: 'string' },
              created_time: { type: 'string' },
              shared: { type: 'bool' },
              owner_names: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
            },
          },
        },
      },
      has_more_children: { type: 'bool' },
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
            can_add_children: { type: 'bool' },
            can_remove_children: { type: 'bool' },
          },
        },
      },
      color_rgb: { type: 'string' },
      viewed_by_me_time: { type: 'string' },
      starred: { type: 'bool' },
    },
  },
});

export default getFolder;
