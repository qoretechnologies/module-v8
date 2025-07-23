import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BROWSE_AI_APP_NAME, BrowseAiError } from '../constants';
import { browseAiApiClient } from '../helpers/constants';
import { getBrowseAiRobotIdAllowedValues } from '../helpers/get-robot-id-allowed-values';
import { mapBrowseAiInputParameterToQoreOptions } from '../helpers/get-robot-input-params';

const action = 'run_bulk_task';

const inputParametersOptions = {
  inputParameters: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
      },
    },
  },
} satisfies TQoreOptions;

const options = {
  title: {
    required: true,
    type: 'string',
  },
  robot: {
    type: 'string',
    required: true,
    get_allowed_values: getBrowseAiRobotIdAllowedValues,
    get_dependent_options: async (context) => {
      const { token, robot } = getQoreContextRequiredValues({
        context,
        connectionFields: ['token'],
        optionFields: ['robot'],
        ErrorClass: BrowseAiError,
      });

      const mappedOptions = await mapBrowseAiInputParameterToQoreOptions({
        token,
        robotId: robot,
      });

      return {
        inputParameters: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: mappedOptions,
            },
          },
        },
      };
    },
  },
} satisfies TQoreOptions;

const runBulkTask = QoreAppCreator.createLocalizedAction<
  typeof options & Partial<typeof inputParametersOptions>
>({
  app: BROWSE_AI_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token, robot, title } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['robot', 'title'],
      ErrorClass: BrowseAiError,
    });

    const inputParameters = obj?.inputParameters;

    try {
      const response = await browseAiApiClient({
        token,
        method: 'POST',
        path: `robots/${robot}/bulk-runs`,
        body: {
          title,
          inputParameters,
        },
        object: 'result.bulkRun',
      });

      return response;
    } catch (error) {
      throw new BrowseAiError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      title: { type: 'string' },
      status: { type: 'string' },
      tasksCount: { type: 'integer' },
      successfulTasks: { type: 'integer' },
      failedTasks: { type: 'integer' },
      robotId: { type: 'string' },
      createdAt: { type: 'number' },
    },
  },
});

export default runBulkTask;
