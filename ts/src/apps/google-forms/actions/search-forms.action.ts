import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_FORMS_APP_NAME, GoogleFormsError } from '../constants';
import { createGoogleDriveClient } from '../../google-drive/helpers/constants';

const options = {
  filename: {
    required: false,
    type: 'string',
    preselected: true,
  },
  search_type: {
    required: false,
    type: 'string',
    allowed_values: [
      {
        display_name: 'Contains',
        value: 'contains',
      },
      {
        display_name: 'Exact Match',
        value: 'exact',
      },
    ],
    default_value: 'contains',
  },
  limit: {
    required: false,
    type: 'number',
    default_value: 50,
  },
  page_token: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const searchForms = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_FORMS_APP_NAME,
  action: 'search_forms',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues<{
      token: string;
    }>({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: GoogleFormsError,
    });

    const filename = obj?.filename || '';
    const search_type = obj?.search_type || 'contains';
    const limit = Math.min(obj?.limit || 50, 1000);
    const page_token = obj?.page_token || undefined;

    try {
      const driveClient = createGoogleDriveClient(token);

      let query = "mimeType='application/vnd.google-apps.form' and trashed=false";

      if (filename) {
        query +=
          search_type === 'exact'
            ? ` and name='${filename.replace(/'/g, "\\'")}'`
            : ` and name contains '${filename.replace(/'/g, "\\'")}'`;
      }

      const response = await driveClient.files.list({
        pageSize: limit,
        pageToken: page_token,
        q: query,
        orderBy: 'modifiedTime desc',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        fields:
          'nextPageToken, files(id, name, description, createdTime, modifiedTime, ' +
          'webViewLink, iconLink, owners, lastModifyingUser, shared)',
      });

      if (!response.data.files) {
        return {
          forms: [],
          count: 0,
          next_page_token: null,
          has_more: false,
        };
      }

      const forms = response.data.files.map((form) => {
        return {
          id: form.id,
          name: form.name,
          description: form.description || '',
          created_at: form.createdTime || '',
          updated_at: form.modifiedTime || '',
          view_url: form.webViewLink || '',
          edit_url: form.webViewLink ? form.webViewLink.replace('/viewform', '/edit') : '',
          icon_url: form.iconLink || '',
          owner: form.owners?.[0]?.displayName || '',
          last_modified_by: form.lastModifyingUser?.displayName || '',
          is_shared: form.shared || false,
        };
      });

      return {
        forms,
        count: forms.length,
        next_page_token: response.data.nextPageToken || null,
        has_more: !!response.data.nextPageToken,
      };
    } catch (error: any) {
      throw new GoogleFormsError(`Failed to search Google Forms: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      forms: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              created_at: { type: 'string' },
              updated_at: { type: 'string' },
              view_url: { type: 'string' },
              edit_url: { type: 'string' },
              icon_url: { type: 'string' },
              owner: { type: 'string' },
              last_modified_by: { type: 'string' },
              is_shared: { type: 'boolean' },
            },
          },
        },
      },
      count: { type: 'number' },
      next_page_token: { type: 'string' },
      has_more: { type: 'boolean' },
    },
  },
});

export default searchForms;
