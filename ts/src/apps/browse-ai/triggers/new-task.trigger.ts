import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { BROWSE_AI_APP_NAME, BrowseAiError } from '../constants';
import { browseAiApiClient } from '../helpers/constants';
import { getBrowseAiRobotIdAllowedValues } from '../helpers/get-robot-id-allowed-values';

const trigger = 'new_task';

const options = {
  robot: {
    type: 'string',
    required: true,
    get_allowed_values: getBrowseAiRobotIdAllowedValues,
  },
  eventType: {
    type: 'string',
    required: true,
    allowed_values: [
      { value: 'taskCapturedDataChanged', display_name: 'Task Captured Data Changed' },
      { value: 'taskFinished', display_name: 'Task Finished' },
      { value: 'taskFinishedSuccessfully', display_name: 'Task Finished Successfully' },
      { value: 'taskFinishedWithError', display_name: 'Task Finished With Error' },
    ],
  },
} satisfies TQoreOptions;

const BrowseAiNewTask = QoreAppCreator.createLocalizedTrigger<typeof options>({
  action: trigger,
  app: BROWSE_AI_APP_NAME,
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options,
  webhook_register: async (context, url) => {
    const { token, robot } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['robot'],
      ErrorClass: BrowseAiError,
    });

    const response = await browseAiApiClient<{ webhook: { id: string } }>({
      method: 'POST',
      token,
      path: `/robots/${robot}/webhooks`,
      body: {
        hookUrl: url,
      },
    });

    return response;
  },
  get_example_event_data: async (context) => {
    const { token, robot } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['robot'],
      ErrorClass: BrowseAiError,
    });

    const tasks = await browseAiApiClient<Record<string, any>[]>({
      token,
      method: 'GET',
      path: `robots/${robot}/tasks`,
      object: 'result.robotTasks.items',
      params: {
        sort: '-createdAt',
      },
    });

    if (!tasks?.[0]) {
      return null;
    }

    return {
      event: 'taskFinished',
      task: tasks[0],
    };
  },
  webhook_deregister: async (context, _url, regInfo) => {
    const { token, robot } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['robot'],
      ErrorClass: BrowseAiError,
    });

    const webhookId = regInfo.webhook.id;

    if (!webhookId) {
      throw new BrowseAiError('Webhook ID is required for deregistration.');
    }

    await browseAiApiClient({
      method: 'DELETE',
      token,
      path: `/robots/${robot}/webhooks/${webhookId}`,
    });
  },
  event_info: {
    desc: 'New Task event data',
    type: {
      type: 'hash',
      fields: {
        event: { type: 'string' },
        task: {
          type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              inputParameters: { type: 'hash' },
              robotId: { type: 'string' },
              status: { type: 'string' },
              runByUserId: { type: 'string' },
              robotBulkRunId: { type: 'string' },
              runByTaskMonitorId: { type: 'string' },
              runByAPI: { type: 'bool' },
              createdAt: { type: 'number' },
              startedAt: { type: 'number' },
              finishedAt: { type: 'number' },
              userFriendlyError: { type: 'string' },
              triedRecordingVideo: { type: 'bool' },
              videoUrl: { type: 'string' },
              videoRemovedAt: { type: 'number' },
              retriedOriginalTaskId: { type: 'string' },
              retriedByTaskId: { type: 'string' },
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
                },
              },
            },
          },
        },
      },
    },
  },
});

export default BrowseAiNewTask;
