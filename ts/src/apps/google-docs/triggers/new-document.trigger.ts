import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { Debugger } from '../../../utils/Debugger';
import { createGoogleDriveClient } from '../../google-drive/helpers/constants';
import { getGoogleDriveFolderIdAllowedValues } from '../../google-drive/helpers/get-folder-id-allowed-values';
import { GOOGLE_DOCS_APP_NAME, GoogleDocsError } from '../constants';

const GoogleDocsNewDocumentTrigger = QoreAppCreator.createLocalizedTrigger({
  app: GOOGLE_DOCS_APP_NAME,
  action: 'new_document',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    folder_id: {
      type: 'string',
      required: false,
      get_allowed_values: getGoogleDriveFolderIdAllowedValues,
    },
    filename: {
      type: 'string',
      required: false,
    },
    search_type: {
      type: 'string',
      required: false,
      default_value: 'contains',
      allowed_values: [
        { display_name: 'Contains', value: 'contains' },
        { display_name: 'Exact Match', value: 'exact' },
      ],
    },
    include_content: {
      type: 'boolean',
      required: false,
      default_value: false,
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: GoogleDocsError,
    });

    const filename = context.opts?.filename;
    const folder_id = context.opts?.folder_id;
    const search_type = context.opts?.search_type || 'contains';
    const include_content = context.opts?.include_content || false;

    const customUpdate = async (file: Record<string, any>) => {
      if (include_content) {
        try {
          const enrichedFile = await fetchFileContent(token, file);
          update(enrichedFile);
        } catch (error) {
          update(file);
        }
      } else {
        update(file);
      }
    };

    const getItems = () => {
      return fetchLatestFiles(token, {
        folderId: folder_id,
        filename,
        search_type,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'google_drive_new_file',
      uniqueField: 'id',
      getItems,
      update: customUpdate,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: GoogleDocsError,
    });

    const filename = context.opts?.filename;
    const search_type = context.opts?.search_type || 'contains';
    const include_content = context.opts?.include_content || false;
    const folderId = context.opts?.folder_id;

    const files = await fetchLatestFiles(token, {
      filename,
      folderId,
      search_type,
    });

    if (files?.length > 0) {
      const file = files[0];
      if (include_content) {
        try {
          return await fetchFileContent(token, file);
        } catch (error) {
          Debugger.log(`Failed to fetch file content for ${file.name}: ${error.message}`);

          return file;
        }
      }

      return file;
    }

    return null;
  },
  event_info: {
    desc: 'Google Drive New File Trigger Event Info',
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
        shared: { type: 'boolean' },
        is_google_doc: { type: 'boolean' },
        trashed: { type: 'boolean' },
        description: { type: 'string' },
        title: { type: 'string' },
        content: { type: 'string' },
        content_as_text: { type: 'string' },
        owner_names: {
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
        last_modifying_user_name: { type: 'string' },
        timestamp: { type: 'string' },
      },
    },
  },
});

const fetchLatestFiles = async (
  token: string,
  options: {
    filename?: string;
    folderId?: string;
    search_type?: string;
  }
) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  try {
    const driveClient = createGoogleDriveClient(token);

    const queryParts = [`trashed = false`, `mimeType != 'application/vnd.google-apps.folder'`];

    if (options.folderId) {
      queryParts.push(`'${options.folderId}' in parents`);
    }

    if (options.filename) {
      if (options.search_type === 'exact') {
        queryParts.push(`name = '${options.filename}'`);
      } else {
        queryParts.push(`name contains '${options.filename}'`);
      }
    }

    queryParts.push("mimeType='application/vnd.google-apps.document'");

    const query = queryParts.join(' and ');

    const response = await driveClient.files.list({
      q: query,
      pageSize: limit,
      fields: '*',
      orderBy: 'createdTime desc',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const files = response.data.files || [];

    return files.map((file) => ({
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
      is_google_doc: file.mimeType?.includes('google-apps'),
      trashed: file.trashed,
      description: file.description || '',
      title: file.name,
      owner_names: file.owners ? file.owners.map((owner) => owner.displayName) : [],
      last_modifying_user_name: file.lastModifyingUser?.displayName || '',
      timestamp: new Date().toISOString(),
      content: null,
      content_as_text: null,
    }));
  } catch (error) {
    throw new GoogleDocsError(`Failed to fetch latest files: ${error.message || error}`);
  }
};

const fetchFileContent = async (token: string, file: Record<string, any>) => {
  try {
    const driveClient = createGoogleDriveClient(token);
    const enrichedFile = { ...file };

    if (file.is_google_doc) {
      const contentResponse = await driveClient.files.export({
        fileId: file.id,
        mimeType: 'text/plain',
      });

      enrichedFile.content = contentResponse.data;
    } else if (!file.is_google_doc && file.web_content_link) {
      const contentResponse = await driveClient.files.get(
        {
          fileId: file.id,
          alt: 'media',
        },
        { responseType: 'arraybuffer' }
      );

      enrichedFile.content = Buffer.from(contentResponse.data as string).toString('base64');

      if (
        file.mime_type?.includes('text/') ||
        file.mime_type?.includes('json') ||
        file.mime_type?.includes('xml') ||
        file.mime_type?.includes('javascript') ||
        file.mime_type?.includes('application/vnd.google-apps.document')
      ) {
        try {
          enrichedFile.content_as_text = Buffer.from(contentResponse.data as string).toString(
            'utf-8'
          );
        } catch (e) {
          Debugger.log(`Failed to convert content to text for ${file.name}: ${e.message}`);
          enrichedFile.content_as_text = null;
        }
      }
    }

    return enrichedFile;
  } catch (error) {
    throw new GoogleDocsError(`Failed to fetch document content: ${error.message || error}`);
  }
};

export default GoogleDocsNewDocumentTrigger;
