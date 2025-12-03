import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CRAFT_APP_NAME, CraftError } from '../constants';
import { craftApiClient } from '../helpers/constants';
import { getCraftActiveTaskAllowedValues } from '../helpers/get-task-allowed-values';

const action = 'delete_tasks';

const options = {
  ids: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: true,
    get_element_allowed_values: getCraftActiveTaskAllowedValues,
    element_allowed_values_creatable: true,
  },
} satisfies TQoreOptions;

type TDeleteTasksRequest = {
  idsToDelete: string[];
};

type TDeleteTasksResponse = {
  items: Array<{
    id: string;
  }>;
};

const DeleteTasks = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CRAFT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { url, ids } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['url'],
      optionFields: ['ids'],
      ErrorClass: CraftError,
    });

    const token = context?.conn_opts?.token;

    if (!ids || ids.length === 0) {
      throw new CraftError('At least one task ID to delete is required');
    }

    const requestBody: TDeleteTasksRequest = { idsToDelete: ids };

    try {
      const response = await craftApiClient<TDeleteTasksResponse>({
        path: 'tasks',
        method: 'DELETE',
        body: requestBody,
        url,
        token,
      });

      return response.items?.map((item) => item.id) || [];
    } catch (error) {
      if (error instanceof CraftError) {
        throw error;
      }

      throw new CraftError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: { type: 'string' },
  },
});

export default DeleteTasks;
