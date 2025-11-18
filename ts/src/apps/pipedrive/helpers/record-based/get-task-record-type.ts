import {
  TQoreAppActionOption,
  TQoreGetDynamicTypeFunction,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import { PipedriveError } from '../../constants';

export const PipedriveTaskRequiredFields = ['title', 'project_id'];

export const PipedriveTaskFields = {
  title: {
    type: 'string',
    required: true,
    desc: 'The title of the task',
  },
  project_id: {
    type: 'int',
    required: true,
    desc: 'The ID of a project',
  },
  description: {
    type: 'string',
    desc: 'The description of the task',
  },
  parent_task_id: {
    type: 'int',
    desc: 'The ID of a parent task. Can not be ID of a task which is already a subtask.',
  },
  assignee_id: {
    type: 'int',
    desc: 'The ID of the user who will be the assignee of the task',
  },
  done: {
    type: 'int',
    desc: 'Whether the task is done or not. 0 = Not done, 1 = Done.',
    allowed_values: [
      { value: 0, desc: 'Not done' },
      { value: 1, desc: 'Done' },
    ],
  },
  due_date: {
    type: 'string',
    desc: 'The due date of the task. Format: YYYY-MM-DD.',
  },
} satisfies Record<string, TQoreAppActionOption>;

export const getPipedriveTaskRecordType: TQoreGetDynamicTypeFunction = async (
  _context
): Promise<TQoreTypeObject> => {
  try {
    return {
      type: 'hash',
      fields: PipedriveTaskFields,
    };
  } catch (error) {
    throw new PipedriveError(`Failed to get Pipedrive task record type: ${error.message || error}`);
  }
};
