import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CRAFT_APP_NAME, CraftError } from '../constants';
import { craftApiClient } from '../helpers/constants';
import { getCraftDocumentAllowedValues } from '../helpers/get-document-allowed-values';

const action = 'list_collections';

const options = {
  documentIds: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
    get_element_allowed_values: getCraftDocumentAllowedValues,
  },
  documentFilterMode: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'include', display_name: 'Include' },
      { value: 'exclude', display_name: 'Exclude' },
    ],
  },
} satisfies TQoreOptions;

type TListCollectionsResponse = {
  items: Array<{
    id: string;
    name: string;
    itemCount: number;
    documentId: string;
  }>;
};

const ListCollections = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CRAFT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { url } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['url'],
      ErrorClass: CraftError,
    });

    const token = context?.conn_opts?.token;
    const { documentIds = [], documentFilterMode = 'include' } = obj || {};

    const documentIdsQuery = documentIds.length
      ? documentIds.map((id) => `documentIds=${id}`).join('&')
      : '';

    try {
      const response = await craftApiClient<TListCollectionsResponse>({
        url,
        token,
        method: 'GET',
        path:
          `collections?documentFilterMode=${documentFilterMode}` +
          (documentIdsQuery ? `&${documentIdsQuery}` : ''),
      });

      return response.items;
    } catch (error) {
      if (error instanceof CraftError) {
        throw error;
      }

      throw new CraftError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        name: { type: 'string' },
        itemCount: { type: 'number' },
        documentId: { type: 'string' },
      },
    },
  },
});

export default ListCollections;
