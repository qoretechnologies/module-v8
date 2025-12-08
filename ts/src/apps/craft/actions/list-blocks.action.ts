import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CRAFT_APP_NAME, CraftError } from '../constants';
import { craftApiClient, extractCraftBlockContent } from '../helpers/constants';
import { getCraftDocumentAllowedValues } from '../helpers/get-document-allowed-values';
import { CraftBlockResponseType } from '../response-types/block';

const action = 'list_blocks';

const options = {
  id: {
    type: 'string',
    required: true,
    get_allowed_values: getCraftDocumentAllowedValues,
    allowed_values_creatable: true,
  },
  maxDepth: {
    type: 'number',
    required: false,
    default_value: -1,
  },
  fetchMetadata: {
    type: 'bool',
    required: false,
    default_value: true,
  },
  getMarkdownString: {
    type: 'bool',
    preselected: true,
  },
} satisfies TQoreOptions;

type TListBlocksResponse = {
  id: string;
  [key: string]: any;
};

const ListBlocks = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CRAFT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { url, id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['url'],
      optionFields: ['id'],
      ErrorClass: CraftError,
    });

    const token = context?.conn_opts?.token;
    const { fetchMetadata = true, maxDepth = -1, getMarkdownString = false } = obj || {};

    try {
      const response = await craftApiClient<TListBlocksResponse>({
        url,
        token,
        method: 'GET',
        path: 'blocks',
        params: {
          id,
          fetchMetadata: fetchMetadata.toString(),
          maxDepth: maxDepth.toString(),
        },
        ...(getMarkdownString === true && {
          headers: {
            Accept: 'text/markdown',
          },
        }),
      });

      if (getMarkdownString === true) {
        return {
          contentString: response as unknown as string,
        };
      }

      return {
        ...response,
        contentString: extractCraftBlockContent(response),
      };
    } catch (error) {
      if (error instanceof CraftError) {
        throw error;
      }

      throw new CraftError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      ...CraftBlockResponseType.fields,
      contentString: { type: 'string' },
    },
  },
  get_dynamic_response_type: (context) => {
    const getMarkdownString = context?.opts?.getMarkdownString;
    return getMarkdownString
      ? {
          type: 'hash',
          fields: {
            contentString: { type: 'string' },
          },
        }
      : {
          type: 'hash',
          fields: {
            ...CraftBlockResponseType.fields,
            contentString: { type: 'string' },
          },
        };
  },
});

export default ListBlocks;
