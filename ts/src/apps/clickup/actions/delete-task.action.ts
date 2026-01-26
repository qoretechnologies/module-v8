import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CLICKUP_APP_NAME, ClickUpError } from '../constants';
import { clickUpClient } from '../client';
import { getClickUpFolderIdAllowedValues } from '../helpers/get-folder-id-allowed-values';
import { getClickUpListIdAllowedValues } from '../helpers/get-list-id-allowed-values';
import { getClickUpSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';
import { getClickUpTaskIdAllowedValues } from '../helpers/get-task-id-allowed-values';
import { getClickUpWorkspaceIdAllowedValues } from '../helpers/get-workspace-id-allowed-values';

const options = {
  workspace: {
    type: 'string',
    required: false,
    preselected: true,
    on_change: ['refetch'],
    get_allowed_values: getClickUpWorkspaceIdAllowedValues,
  },
  space: {
    type: 'string',
    required: false,
    preselected: true,
    get_allowed_values: getClickUpSpaceIdAllowedValues,
    on_change: ['refetch'],
    depends_on: ['workspace'],
  },
  folder: {
    type: 'string',
    required: false,
    preselected: true,
    depends_on: ['space'],
    on_change: ['refetch'],
    get_allowed_values: getClickUpFolderIdAllowedValues,
  },
  list: {
    type: 'string',
    required: false,
    preselected: true,
    on_change: ['refetch'],
    get_allowed_values: getClickUpListIdAllowedValues,
  },
  task: {
    type: 'string',
    required: true,
    get_allowed_values: getClickUpTaskIdAllowedValues,
  },
} satisfies TQoreOptions;

const deleteTask = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CLICKUP_APP_NAME,
  action: 'delete_task',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, task } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['task'],
      ErrorClass: ClickUpError,
    });

    try {
      await clickUpClient.delete(`task/${task}`, { token });
    } catch (error) {
      throw new ClickUpError(`Failed to delete task: ${error}`);
    }
  },
});

export default deleteTask;
