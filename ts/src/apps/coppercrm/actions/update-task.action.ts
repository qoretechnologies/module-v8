import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { COPPER_CRM_APP_NAME, CopperCrmError } from '../constants';
import { copperCrmApiClient } from '../helpers/constants';
import {
  getCopperCrmCustomFieldDynamicResponseTypeFunction,
  getCopperCrmCustomFieldDynamicTypeFunction,
  mapCopperCrmCustomFieldsObjectToArray,
  mapCopperCrmCustomFieldsResponseArrayToObject,
  TCopperCrmCustomFieldValue,
} from '../helpers/get-custom-fields';
import { getCopperCrmTagAllowedValues } from '../helpers/get-tag-allowed-values';
import { getCopperCrmTaskAllowedValues } from '../helpers/get-task-allowed-values';
import { getCopperCrmUserAllowedValues } from '../helpers/get-user-allowed-values';
import { CopperCrmTaskResponseType } from '../response-types/task';

const action = 'update_task';

const options = {
  task_id: {
    type: 'number',
    required: true,
    get_allowed_values: getCopperCrmTaskAllowedValues,
  },
  name: {
    type: 'string',
  },
  related_resource: {
    type: {
      type: 'hash',
      fields: {
        id: {
          type: 'number',
          required: true,
        },
        type: {
          type: 'string',
          required: true,
          allowed_values: [
            { value: 'lead', display_name: 'Lead' },
            { value: 'person', display_name: 'Person' },
            { value: 'company', display_name: 'Company' },
            { value: 'opportunity', display_name: 'Opportunity' },
            { value: 'project', display_name: 'Project' },
          ],
        },
      },
    },
  },
  assignee_id: {
    type: 'number',
    get_allowed_values: getCopperCrmUserAllowedValues,
  },
  due_date: {
    type: 'date',
  },
  reminder_date: {
    type: 'date',
  },
  priority: {
    type: 'string',
    allowed_values: [
      { value: 'None', display_name: 'None' },
      { value: 'Low', display_name: 'Low' },
      { value: 'Medium', display_name: 'Medium' },
      { value: 'High', display_name: 'High' },
    ],
  },
  status: {
    type: 'string',
    allowed_values: [
      { value: 'Open', display_name: 'Open' },
      { value: 'Completed', display_name: 'Completed' },
    ],
  },
  details: {
    type: 'string',
  },
  tags: {
    type: {
      type: 'list',
      element_type: { type: 'string' },
    },
    get_element_allowed_values: getCopperCrmTagAllowedValues,
    element_allowed_values_creatable: true,
  },
  custom_fields: {
    type: {
      type: 'hash',
    },
    get_dynamic_type: getCopperCrmCustomFieldDynamicTypeFunction(['task']),
  },
} satisfies TQoreOptions;

type TUpdateTaskResponse = {
  id: string;
  [key: string]: any;
  custom_fields?: Array<TCopperCrmCustomFieldValue>;
  date_created: number;
  date_modified: number;
};

const UpdateTask = QoreAppCreator.createLocalizedAction<typeof options>({
  app: COPPER_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, task_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['task_id'],
      ErrorClass: CopperCrmError,
    });

    const customFields = obj?.custom_fields
      ? mapCopperCrmCustomFieldsObjectToArray(obj.custom_fields)
      : [];

    const baseFields = omit(obj, ['custom_fields', 'task_id']);

    const body = {
      ...baseFields,
      ...(customFields.length && { custom_fields: customFields }),
    };

    try {
      const response = await copperCrmApiClient<TUpdateTaskResponse>({
        path: `tasks/${task_id}`,
        method: 'PUT',
        token,
        body,
      });

      const { custom_fields, ...restResponse } = response;

      const formattedCustomFields = custom_fields
        ? await mapCopperCrmCustomFieldsResponseArrayToObject({
            token,
            customFieldsArray: custom_fields,
          })
        : {};

      return {
        ...restResponse,
        custom_fields: formattedCustomFields,
      };
    } catch (error) {
      if (error instanceof CopperCrmError) {
        throw error;
      }

      throw new CopperCrmError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: CopperCrmTaskResponseType,
  get_dynamic_response_type: async (context) => {
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

export default UpdateTask;
