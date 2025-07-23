import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BROWSE_AI_APP_NAME, BrowseAiError } from '../constants';
import { browseAiApiClient } from '../helpers/constants';
import { getBrowseAiRobotIdAllowedValues } from '../helpers/get-robot-id-allowed-values';
import { mapBrowseAiInputParameterToQoreOptions } from '../helpers/get-robot-input-params';
import { omit } from 'lodash';

const action = 'run_task';

const options = {
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

      return await mapBrowseAiInputParameterToQoreOptions({
        token,
        robotId: robot,
      });
    },
  },
} satisfies TQoreOptions;

const runTask = QoreAppCreator.createLocalizedAction<typeof options>({
  app: BROWSE_AI_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token, robot } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['robot'],
      ErrorClass: BrowseAiError,
    });

    const inputParameters = omit(context?.opts, ['robot', 'title']);

    try {
      const response = await browseAiApiClient({
        token,
        method: 'POST',
        path: `robots/${robot}/tasks`,
        body: {
          inputParameters,
        },
        object: 'result',
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
      inputParameters: { type: 'hash' },
      robotId: { type: 'string' },
      status: { type: 'string' },
      runByUserId: { type: 'string' },
      robotBulkRunId: { type: 'string' },
      runByTaskMonitorId: { type: 'string' },
      runByAPI: { type: 'boolean' },
      createdAt: { type: 'number' },
      startedAt: { type: 'number' },
      finishedAt: { type: 'number' },
      userFriendlyError: { type: 'string' },
      triedRecordingVideo: { type: 'boolean' },
      videoUrl: { type: 'string' },
      videoRemovedAt: { type: 'number' },
      retriedOriginalTaskId: { type: 'string' },
      retriedByTaskId: { type: 'string' },
      capturedDataTemporaryUrl: { type: 'string' },
      capturedTexts: { type: 'hash' },
      capturedScreenshots: {
        type: {
          type: 'hash',
          fields: {
            'top-ads': {
              type: {
                type: 'hash',
                fields: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  src: { type: 'string' },
                  width: { type: 'integer' },
                  height: { type: 'integer' },
                  x: { type: 'integer' },
                  y: { type: 'integer' },
                  deviceScaleFactor: { type: 'number' },
                  full: { type: 'string' },
                  comparedToScreenshotId: { type: 'string' },
                  diffImageSrc: { type: 'string' },
                  changePercentage: { type: 'integer' },
                  diffThreshold: { type: 'integer' },
                  fileRemovedAt: { type: 'number' },
                },
              },
            },
          },
        },
      },
      capturedLists: {
        type: {
          type: 'hash',
          fields: {
            companies: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    Position: { type: 'string' },
                    name: { type: 'string' },
                    location: { type: 'string' },
                    description: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

export default runTask;
