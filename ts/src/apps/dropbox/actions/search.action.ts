import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { dropboxClient } from '../client';
import { DROPBOX_APP_NAME, DropboxError } from '../constants';
import { getDropboxFolderAllowedValues } from '../helpers/get-folder-allowed-values';
import { DropboxSearchResultResponseType } from '../response-types';

const action = 'search';

const options = {
  query: {
    type: 'string',
    required: true,
  },
  path: {
    type: 'string',
    required: false,
    get_allowed_values: getDropboxFolderAllowedValues,
  },
  maxResults: {
    type: 'integer',
    required: false,
    default_value: 100,
  },
  orderBy: {
    type: 'string',
    required: false,
    default_value: 'relevance',
    allowed_values: [
      { value: 'relevance', display_name: 'Relevance' },
      { value: 'modified_time', display_name: 'Modified Time' },
    ],
  },
  fileStatus: {
    type: 'string',
    required: false,
    default_value: 'active',
    allowed_values: [
      { value: 'active', display_name: 'Active' },
      { value: 'deleted', display_name: 'Deleted' },
    ],
  },
  filenameOnly: {
    type: 'bool',
    required: false,
    default_value: false,
  },
  fileExtensions: {
    type: 'string',
    required: false,
  },
  fileCategories: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const Search = QoreAppCreator.createLocalizedAction<typeof options>({
  app: DROPBOX_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: DropboxSearchResultResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, query } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['query'],
      connectionFields: ['token'],
      ErrorClass: DropboxError,
    });

    const searchOptions: Record<string, any> = {
      path: obj?.path || '',
      max_results: obj?.maxResults || 100,
      file_status: obj?.fileStatus || 'active',
      filename_only: obj?.filenameOnly ?? false,
    };

    if (obj?.orderBy) {
      searchOptions.order_by = { '.tag': obj.orderBy };
    }

    if (obj?.fileExtensions) {
      searchOptions.file_extensions = obj.fileExtensions.split(',').map((ext: string) => ext.trim());
    }

    if (obj?.fileCategories) {
      searchOptions.file_categories = obj.fileCategories
        .split(',')
        .map((cat: string) => ({ '.tag': cat.trim() }));
    }

    try {
      const result = await dropboxClient.post<Record<string, any>>(
        'files/search_v2',
        {
          query,
          options: searchOptions,
        },
        { token }
      );

      return result;
    } catch (error) {
      throw new DropboxError(`Failed to search: ${error.message || error}`);
    }
  },
});

export default Search;
