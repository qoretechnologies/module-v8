import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CRAFT_APP_NAME, CraftError } from '../constants';
import { craftApiClient } from '../helpers/constants';

const action = 'list_documents';

const options = {} satisfies TQoreOptions;

type TListDocumentsResponse = {
  items: Array<{
    id: string;
    title: string;
    isDeleted: boolean;
  }>;
};

const ListDocuments = QoreAppCreator.createLocalizedAction<typeof options>({
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

    try {
      const response = await craftApiClient<TListDocumentsResponse>({
        url,
        token,
        method: 'GET',
        path: 'documents',
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
        title: { type: 'string' },
        isDeleted: { type: 'bool' },
      },
    },
  },
});

export default ListDocuments;
