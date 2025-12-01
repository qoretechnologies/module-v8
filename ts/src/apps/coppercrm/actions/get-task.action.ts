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
  mapCopperCrmCustomFieldsResponseArrayToObject,
  TCopperCrmCustomFieldValue,
} from '../helpers/get-custom-fields';
import { getCopperCrmTaskAllowedValues } from '../helpers/get-task-allowed-values';
import { CopperCrmTaskResponseType } from '../response-types/task';

const action = 'get_task';

const options = {
  task_id: {
    type: 'number',
    required: true,
    get_allowed_values: getCopperCrmTaskAllowedValues,
  },
} satisfies TQoreOptions;

type TGetTaskResponse = {
  id: string;
  [key: string]: any;
  custom_fields?: Array<TCopperCrmCustomFieldValue>;
  date_created: number;
  date_modified: number;
};

const GetTask = QoreAppCreator.createLocalizedAction<typeof options>({
  app: COPPER_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, email, task_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['email', 'token'],
      optionFields: ['task_id'],
      ErrorClass: CopperCrmError,
    });

    try {
      const response = await copperCrmApiClient<TGetTaskResponse>({
        path: `tasks/${task_id}`,
        method: 'GET',
        token,
        email,
      });

      const { custom_fields, ...restResponse } = response;

      const formattedCustomFields = custom_fields
        ? await mapCopperCrmCustomFieldsResponseArrayToObject({
            token,
            email,
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

export default GetTask;
