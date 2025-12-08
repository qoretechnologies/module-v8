import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { createGoogleDriveClient } from '../../google-drive/helpers/constants';
import { GOOGLE_DOCS_APP_NAME, GoogleDocsError } from '../constants';
import { getGoogleDocsDocumentIdAllowedValues } from '../helpers/get-document-id-allowed-values';

const options = {
  document_id: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getGoogleDocsDocumentIdAllowedValues,
  },
} satisfies TQoreOptions;

const response_type = {
  type: 'hash',
  fields: {
    document_id: { type: 'string' },
    plain: { type: 'string' },
    kind: { type: 'string' },
    mimeType: { type: 'string' },
    name: { type: 'string' },
    starred: { type: 'bool' },
    trashed: { type: 'bool' },
    explicitlyTrashed: { type: 'bool' },
    parents: { type: { type: 'list', element_type: { type: 'string' } } },
    spaces: { type: { type: 'list', element_type: { type: 'string' } } },
    version: { type: 'string' },
    webViewLink: { type: 'string' },
    iconLink: { type: 'string' },
    hasThumbnail: { type: 'bool' },
    thumbnailLink: { type: 'string' },
    thumbnailVersion: { type: 'string' },
    viewedByMe: { type: 'bool' },
    viewedByMeTime: { type: 'string' },
    createdTime: { type: 'string' },
    modifiedTime: { type: 'string' },
    modifiedByMeTime: { type: 'string' },
    modifiedByMe: { type: 'bool' },
    owners: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            kind: { type: 'string' },
            displayName: { type: 'string' },
            photoLink: { type: 'string' },
            me: { type: 'bool' },
            permissionId: { type: 'string' },
            emailAddress: { type: 'string' },
          },
        },
      },
    },
    lastModifyingUser: {
      type: {
        type: 'hash',
        fields: {
          kind: { type: 'string' },
          displayName: { type: 'string' },
          photoLink: { type: 'string' },
          permissionId: { type: 'string' },
          emailAddress: { type: 'string' },
        },
      },
    },
    shared: { type: 'bool' },
    ownedByMe: { type: 'bool' },
    capabilities: {
      type: {
        type: 'hash',
        fields: {
          canAcceptOwnership: { type: 'bool' },
          canAddChildren: { type: 'bool' },
          canAddMyDriveParent: { type: 'bool' },
          canChangeCopyRequiresWriterPermission: { type: 'bool' },
          canChangeSecurityUpdateEnabled: { type: 'bool' },
          canChangeViewersCanCopyContent: { type: 'bool' },
          canComment: { type: 'bool' },
          canCopy: { type: 'bool' },
          canDelete: { type: 'bool' },
          canDisableInheritedPermissions: { type: 'bool' },
          canDownload: { type: 'bool' },
          canEdit: { type: 'bool' },
          canEnableInheritedPermissions: { type: 'bool' },
          canListChildren: { type: 'bool' },
          canModifyContent: { type: 'bool' },
          canModifyContentRestriction: { type: 'bool' },
          canModifyEditorContentRestriction: { type: 'bool' },
          canModifyOwnerContentRestriction: { type: 'bool' },
          canModifyLabels: { type: 'bool' },
          canMoveChildrenWithinDrive: { type: 'bool' },
          canMoveItemIntoTeamDrive: { type: 'bool' },
          canMoveItemOutOfDrive: { type: 'bool' },
          canMoveItemWithinDrive: { type: 'bool' },
          canReadLabels: { type: 'bool' },
          canReadRevisions: { type: 'bool' },
          canRemoveChildren: { type: 'bool' },
          canRemoveContentRestriction: { type: 'bool' },
          canRemoveMyDriveParent: { type: 'bool' },
          canRename: { type: 'bool' },
          canShare: { type: 'bool' },
          canTrash: { type: 'bool' },
          canUntrash: { type: 'bool' },
        },
      },
    },
    viewersCanCopyContent: { type: 'bool' },
    copyRequiresWriterPermission: { type: 'bool' },
    writersCanShare: { type: 'bool' },
    permissions: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            kind: { type: 'string' },
            id: { type: 'string' },
            type: { type: 'string' },
            domain: { type: 'string' },
            role: { type: 'string' },
            allowFileDiscovery: { type: 'bool' },
            emailAddress: { type: 'string' },
            displayName: { type: 'string' },
            deleted: { type: 'bool' },
            pendingOwner: { type: 'bool' },
          },
        },
      },
    },
    permissionIds: { type: { type: 'list', element_type: { type: 'string' } } },
    size: { type: 'string' },
    quotaBytesUsed: { type: 'string' },
    isAppAuthorized: { type: 'bool' },
    exportLinks: {
      type: {
        type: 'hash',
        fields: {
          'application/rtf': { type: 'string' },
          'application/vnd.oasis.opendocument.text': { type: 'string' },
          'text/html': { type: 'string' },
          'application/pdf': { type: 'string' },
          'text/x-markdown': { type: 'string' },
          'text/markdown': { type: 'string' },
          'application/epub+zip': { type: 'string' },
          'application/zip': { type: 'string' },
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
            type: 'string',
          },
          'text/plain': { type: 'string' },
        },
      },
    },
    linkShareMetadata: {
      type: {
        type: 'hash',
        fields: {
          securityUpdateEligible: { type: 'bool' },
          securityUpdateEnabled: { type: 'bool' },
        },
      },
    },
    inheritedPermissionsDisabled: { type: 'bool' },
  },
} satisfies TQoreResponseType;

export const getDocumentById = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_DOCS_APP_NAME,
  action: 'get_document_by_id',
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type,
  api_function: async (data, _opts, context) => {
    const { token, document_id } = getQoreContextRequiredValues({
      context: { ...context, opts: data },
      optionFields: ['document_id'],
      connectionFields: ['token'],
      ErrorClass: GoogleDocsError,
    });

    try {
      const driveClient = createGoogleDriveClient(token);

      const [filePlainResponse, fileResponse] = await Promise.all([
        driveClient.files.export({
          fileId: document_id,
          mimeType: 'text/plain',
        }),
        driveClient.files.get({
          fileId: document_id,
          fields: '*',
        }),
      ]);

      const file = fileResponse.data;

      if (!file) {
        throw new GoogleDocsError(`File not found`);
      }

      return {
        document_id: fileResponse.data.id,
        plain: filePlainResponse.data,
        ...omit(file, ['id']),
      };
    } catch (error: any) {
      throw new GoogleDocsError(
        `Failed to get document by ID: ${error.message || 'Unknown error'}`
      );
    }
  },
});

export default getDocumentById;
