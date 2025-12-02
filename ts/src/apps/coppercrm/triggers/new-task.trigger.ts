import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { COPPER_CRM_APP_NAME, CopperCrmError } from '../constants';
import { copperCrmApiClient } from '../helpers/constants';
import {
  getCopperCrmCustomFieldDynamicResponseTypeFunction,
  mapCopperCrmRecordsCustomFieldsResponseArray,
  TCopperCrmCustomFieldValue,
} from '../helpers/get-custom-fields';
import { CopperCrmTaskResponseType } from '../response-types/task';
import { getCopperCrmTagAllowedValues } from '../helpers/get-tag-allowed-values';
import { getCopperCrmUserAllowedValues } from '../helpers/get-user-allowed-values';
import { getCopperCrmTaskAllowedValues } from '../helpers/get-task-allowed-values';

const action = 'new_task';

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
} satisfies TQoreOptions;

const NewTask = QoreAppCreator.createLocalizedTrigger({
  app: COPPER_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: CopperCrmError,
    });

    const opts = context.opts || {};

    const getItems = () => {
      return fetchLatestRecords({
        token,
        filters: opts,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `coppercrm_${action}`,
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      ErrorClass: CopperCrmError,
    });

    const records = await fetchLatestRecords({
      token,
      filters: context.opts || {},
    });

    return records?.length > 0 ? records[0] : null;
  },
  event_info: {
    desc: 'Copper CRM New Task Trigger Event Info',
    type: CopperCrmTaskResponseType,
  },
  get_dynamic_type: async (context) => {
    const customFields = await getCopperCrmCustomFieldDynamicResponseTypeFunction(['task'])(
      context
    );

    return {
      type: 'hash',
      fields: {
        ...CopperCrmTaskResponseType.fields,
        custom_fields: customFields as TQoreAppActionOption,
      },
    };
  },
});

export default NewTask;

type TFetchRowsOptions = {
  token: string;
  filters?: Record<string, any>;
};

type TRecordsResponse = {
  results: Array<{ custom_fields?: TCopperCrmCustomFieldValue[]; [key: string]: any }>;
};

const fetchLatestRecords = async (options: TFetchRowsOptions): Promise<Record<string, any>[]> => {
  const { token, filters } = options;
  const limit = 20;

  try {
    const response = await copperCrmApiClient<TRecordsResponse>({
      path: `tasks/search`,
      method: 'POST',
      token,
      body: {
        ...filters,
        page_size: limit,
        page_number: 1,
        sort_by: 'date_created',
        sort_direction: 'desc',
      },
    });

    const formattedTasks = await mapCopperCrmRecordsCustomFieldsResponseArray({
      token,
      records: response.results,
    });

    return formattedTasks;
  } catch (error) {
    throw new CopperCrmError(`Failed to fetch latest tasks: ${error.message || error}`);
  }
};
