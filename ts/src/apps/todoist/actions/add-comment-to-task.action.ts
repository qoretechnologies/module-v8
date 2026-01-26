import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TODOIST_APP_NAME, TodoistError } from '../constants';
import { todoistApiClient } from '../helpers/constants';
import { getTodoistTaskAllowedValues } from '../helpers/get-task-allowed-values';

const action = 'add_comment_to_task';

const options = {
  content: {
    type: 'string',
    required: true,
  },
  task_id: {
    type: 'string',
    required: true,
    get_allowed_values: getTodoistTaskAllowedValues,
  },
} satisfies TQoreOptions;

const addCommentToTask = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TODOIST_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, task_id, content } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['task_id', 'content'],
      ErrorClass: TodoistError,
    });

    try {
      const response = await todoistApiClient<{
        results: Record<string, any>[];
        next_cursor?: string;
      }>({
        path: `comments`,
        method: 'POST',
        token,
        body: {
          task_id,
          content,
        },
      });

      return response;
    } catch (error) {
      throw new TodoistError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      posted_uid: { type: 'string' },
      content: { type: 'string' },
      file_attachment: { type: 'hash' },
      uids_to_notify: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      is_deleted: { type: 'bool' },
      posted_at: { type: 'string' },
      reactions: { type: 'hash' },
    },
  },
});

export default addCommentToTask;
