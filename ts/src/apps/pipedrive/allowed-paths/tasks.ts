import {
  TAllowedPaths,
  TCustomConnOptions,
  TQoreAppActionOverrideOption,
} from '@qoretechnologies/ts-toolkit';
import { getPipedriveProjectIdAllowedValues } from '../helpers/get-project-id-allowed-values';
import {
  getPipedriveParentTaskIdAllowedValues,
  getPipedriveTaskIdAllowedValues,
} from '../helpers/get-task-id-allowd-values';
import { getPipedriveUserIdAllowedValues } from '../helpers/get-user-id-allowed-values';

const tasksOptions = {
  project_id: {
    get_allowed_values: getPipedriveProjectIdAllowedValues,
  },
  assignee_id: {
    get_allowed_values: getPipedriveUserIdAllowedValues,
  },
  parent_task_id: {
    get_allowed_values: getPipedriveParentTaskIdAllowedValues,
  },
} satisfies Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;

export const PIPEDRIVE_TASKS_ALLOWED_PATHS = {
  '/tasks': {
    GET: {
      override_options: {
        assignee_id: {
          get_allowed_values: getPipedriveUserIdAllowedValues,
        },
        project_id: {
          get_allowed_values: getPipedriveProjectIdAllowedValues,
        },
        parent_task_id: {
          get_allowed_values: getPipedriveParentTaskIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: tasksOptions,
    },
  },
  '/tasks/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getPipedriveTaskIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          get_allowed_values: getPipedriveTaskIdAllowedValues,
        },
        ...tasksOptions,
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getPipedriveTaskIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;
