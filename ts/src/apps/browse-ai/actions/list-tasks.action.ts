import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BROWSE_AI_APP_NAME, BrowseAiError } from '../constants';
import { browseAiApiClient } from '../helpers/constants';
import { getBrowseAiRobotIdAllowedValues } from '../helpers/get-robot-id-allowed-values';

const action = 'list_tasks';

const options = {
  robot: {
    type: 'string',
    required: true,
    get_allowed_values: getBrowseAiRobotIdAllowedValues,
  },
  page: {
    type: 'number',
    required: false,
  },
  pageSize: {
    type: 'number',
    required: false,
    default_value: 10,
  },
  status: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'failed', display_name: 'Failed' },
      { value: 'successful', display_name: 'Successful' },
      { value: 'in-progress', display_name: 'In Progress' },
    ],
  },

  sort: {
    type: {
      type: 'hash',
      fields: {
        field: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'createdAt', display_name: 'Created At' },
            { value: 'finishedAt', display_name: 'Finished At' },
          ],
        },
        order: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'asc', display_name: 'Ascending' },
            { value: 'desc', display_name: 'Descending' },
          ],
        },
      },
    },
  },
  includeRetried: {
    type: 'bool',
    required: false,
  },
  fromDate: {
    type: 'date',
    required: false,
  },
  toDate: {
    type: 'date',
    required: false,
  },
} satisfies TQoreOptions;

const listTasks = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const fromDate = obj?.fromDate ? new Date(obj.fromDate).getTime() : undefined;
    const toDate = obj?.toDate ? new Date(obj.toDate).getTime() : undefined;

    const { includeRetried, page = 1, pageSize = 10, sort, status } = obj || {};
    const sortString = sort ? `${sort.order === 'desc' ? '-' : ''}${sort.field}` : '-createdAt';

    try {
      const response = await browseAiApiClient({
        token,
        method: 'GET',
        params: {
          page: page.toString(),
          pageSize: pageSize.toString(),
          sort: sortString,
          ...(includeRetried && { includeRetried: includeRetried === true ? 'true' : 'false' }),
          ...(fromDate && { fromDate: fromDate.toString() }),
          ...(toDate && { toDate: toDate.toString() }),
          ...(status && { status }),
        },
        path: `robots/${robot}/tasks`,
        object: 'result.robotTasks',
      });

      return response;
    } catch (error) {
      throw new BrowseAiError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      totalCount: { type: 'integer' },
      pageNumber: { type: 'integer' },
      hasMore: { type: 'bool' },
      items: {
        type: {
          type: 'list',
          element_type: {
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
        },
      },
    },
  },
});

export default listTasks;
