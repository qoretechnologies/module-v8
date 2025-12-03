import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CRAFT_APP_NAME, CraftError } from '../constants';
import { craftApiClient } from '../helpers/constants';

const action = 'delete_blocks';

const options = {
  blockIds: {
    required: true,
    type: {
      type: 'list',
      element_type: 'string',
    },
  },
} satisfies TQoreOptions;

type TDeleteBlocksResponse = {
  items: Array<{
    id: string;
  }>;
};

const DeleteBlocks = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CRAFT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { url, blockIds } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['url'],
      optionFields: ['blockIds'],
      ErrorClass: CraftError,
    });

    const token = context?.conn_opts?.token;

    try {
      const response = await craftApiClient<TDeleteBlocksResponse>({
        url,
        token,
        method: 'DELETE',
        path: 'blocks',
        body: { blockIds },
      });

      return response.items?.map((block) => block.id);
    } catch (error) {
      if (error instanceof CraftError) {
        throw error;
      }

      throw new CraftError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: 'string',
  },
});

export default DeleteBlocks;
