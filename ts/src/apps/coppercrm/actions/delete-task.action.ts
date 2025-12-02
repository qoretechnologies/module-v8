import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { COPPER_CRM_APP_NAME, CopperCrmError } from '../constants';
import { copperCrmApiClient } from '../helpers/constants';
import { getCopperCrmTaskAllowedValues } from '../helpers/get-task-allowed-values';

const action = 'delete_task';

const options = {
  task_id: {
    type: 'number',
    required: true,
    get_allowed_values: getCopperCrmTaskAllowedValues,
  },
} satisfies TQoreOptions;

type TDeleteTaskResponse = {
  id: string;
  is_deleted: boolean;
};

const DeleteTask = QoreAppCreator.createLocalizedAction<typeof options>({
  app: COPPER_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, task_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['task_id'],
      ErrorClass: CopperCrmError,
    });

    try {
      const response = await copperCrmApiClient<TDeleteTaskResponse>({
        path: `tasks/${task_id}`,
        method: 'DELETE',
        token,
      });

      return response;
    } catch (error) {
      if (error instanceof CopperCrmError) {
        throw error;
      }

      throw new CopperCrmError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: {
        type: 'string',
      },
      is_deleted: {
        type: 'boolean',
      },
    },
  },
});

export default DeleteTask;
