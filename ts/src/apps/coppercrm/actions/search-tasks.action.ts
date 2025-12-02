import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { COPPER_CRM_APP_NAME, CopperCrmError } from '../constants';
import { copperCrmApiClient } from '../helpers/constants';
import {
  getCopperCrmCustomFieldDynamicResponseTypeFunction,
  mapCopperCrmRecordsCustomFieldsResponseArray,
  TCopperCrmCustomFieldValue,
} from '../helpers/get-custom-fields';
import { getCopperCrmTagAllowedValues } from '../helpers/get-tag-allowed-values';
import { getCopperCrmTaskAllowedValues } from '../helpers/get-task-allowed-values';
import { getCopperCrmUserAllowedValues } from '../helpers/get-user-allowed-values';
import { CopperCrmTaskResponseType } from '../response-types/task';

const action = 'search_tasks';

const dateFields = [
  'minimum_due_date',
  'maximum_due_date',
  'minimum_reminder_date',
  'maximum_reminder_date',
  'minimum_completed_date',
  'maximum_completed_date',
  'minimum_created_date',
  'maximum_created_date',
  'minimum_modified_date',
  'maximum_modified_date',
];

const options = {
  ids: {
    type: {
      type: 'list',
      element_type: { type: 'number' },
    },
    get_element_allowed_values: getCopperCrmTaskAllowedValues,
  },
  page_number: {
    type: 'number',
    preselected: true,
  },
  page_size: {
    type: 'number',
    preselected: true,
  },
  sort_by: {
    type: 'string',
    preselected: true,
    allowed_values: [
      { value: 'name', display_name: 'Name' },
      { value: 'assigned_to', display_name: 'Assigned To' },
      { value: 'related_to', display_name: 'Related To' },
      { value: 'status', display_name: 'Status' },
      { value: 'priority', display_name: 'Priority' },
      { value: 'due_date', display_name: 'Due Date' },
      { value: 'reminder_date', display_name: 'Reminder Date' },
      { value: 'completed_date', display_name: 'Completed Date' },
      { value: 'date_created', display_name: 'Date Created' },
      { value: 'date_modified', display_name: 'Date Modified' },
    ],
  },
  sort_direction: {
    type: 'string',
    preselected: true,
    allowed_values: [
      { value: 'asc', display_name: 'Ascending' },
      { value: 'desc', display_name: 'Descending' },
    ],
  },
  assignee_ids: {
    type: {
      type: 'list',
      element_type: { type: 'number' },
    },
    get_element_allowed_values: getCopperCrmUserAllowedValues,
  },
  statuses: {
    type: {
      type: 'list',
      element_type: { type: 'string' },
    },
    element_allowed_values: [
      { value: 'Open', display_name: 'Open' },
      { value: 'Completed', display_name: 'Completed' },
    ],
  },
  priorities: {
    type: {
      type: 'list',
      element_type: { type: 'string' },
    },
    element_allowed_values: [
      { value: 'None', display_name: 'None' },
      { value: 'Low', display_name: 'Low' },
      { value: 'Medium', display_name: 'Medium' },
      { value: 'High', display_name: 'High' },
    ],
  },
  tags: {
    type: {
      type: 'list',
      element_type: { type: 'string' },
    },
    get_element_allowed_values: getCopperCrmTagAllowedValues,
    element_allowed_values_creatable: true,
  },
  followed: {
    type: 'number',
    allowed_values: [
      { value: 1, display_name: 'Followed' },
      { value: 0, display_name: 'Not Followed' },
    ],
  },
  minimum_due_date: {
    type: 'date',
  },
  maximum_due_date: {
    type: 'date',
  },
  minimum_reminder_date: {
    type: 'date',
  },
  maximum_reminder_date: {
    type: 'date',
  },
  minimum_completed_date: {
    type: 'date',
  },
  maximum_completed_date: {
    type: 'date',
  },
  minimum_created_date: {
    type: 'date',
  },
  maximum_created_date: {
    type: 'date',
  },
  minimum_modified_date: {
    type: 'date',
  },
  maximum_modified_date: {
    type: 'date',
  },
} satisfies TQoreOptions;

type TSearchTasksResponse = {
  results: {
    id: string;
    [key: string]: any;
    custom_fields?: Array<TCopperCrmCustomFieldValue>;
    date_created: number;
    date_modified: number;
  }[];
};

const SearchTasks = QoreAppCreator.createLocalizedAction<typeof options>({
  app: COPPER_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: CopperCrmError,
    });

    try {
      const formattedObj = { ...obj } as Record<string, any>;

      dateFields.forEach((field) => {
        const value = formattedObj[field];
        if (value) {
          formattedObj[field] = new Date(value).getTime();
        }
      });

      const response = await copperCrmApiClient<TSearchTasksResponse>({
        path: `tasks/search`,
        method: 'POST',
        token,
        body: formattedObj,
      });

      const results = response.results || [];

      const formattedTasks = await mapCopperCrmRecordsCustomFieldsResponseArray({
        token,
        records: results,
      });

      return formattedTasks;
    } catch (error) {
      if (error instanceof CopperCrmError) {
        throw error;
      }

      throw new CopperCrmError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: CopperCrmTaskResponseType,
  },
  get_dynamic_response_type: async (context) => {
    const customFields = await getCopperCrmCustomFieldDynamicResponseTypeFunction(['task'])(
      context
    );

    return {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          ...CopperCrmTaskResponseType.fields,
          custom_fields: customFields as TQoreAppActionOption,
        },
      },
    };
  },
});

export default SearchTasks;
