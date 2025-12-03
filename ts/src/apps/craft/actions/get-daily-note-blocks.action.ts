import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CRAFT_APP_NAME, CraftError } from '../constants';
import { craftApiClient, extractCraftBlockContent } from '../helpers/constants';
import { CraftBlockResponseType } from '../response-types/block';

const action = 'get_blocks';

const options = {
  date: {
    type: 'date',
    required: false,
  },
  day: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'today', display_name: 'Today' },
      { value: 'yesterday', display_name: 'Yesterday' },
      { value: 'tomorrow', display_name: 'Tomorrow' },
    ],
  },
  maxDepth: {
    type: 'number',
    required: false,
    default_value: -1,
  },
  fetchMetadata: {
    type: 'boolean',
    required: false,
  },
} satisfies TQoreOptions;

type TGetBlocksResponse = {
  id: string;
  content: {
    id: string;
  }[];
};

const GetBlocks = QoreAppCreator.createLocalizedAction<typeof options>({
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
    const { date, day, fetchMetadata, maxDepth } = obj || {};
    const formattedDate = date ? new Date(date).toISOString().split('T')[0] : day || 'today';

    try {
      const response = await craftApiClient<TGetBlocksResponse>({
        path: `blocks`,
        method: 'GET',
        params: {
          date: formattedDate,
          ...(fetchMetadata !== undefined && { fetchMetadata: String(fetchMetadata) }),
          ...(maxDepth !== undefined && { maxDepth: String(maxDepth) }),
        },
        url,
        token,
      });

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
});

export default GetBlocks;
