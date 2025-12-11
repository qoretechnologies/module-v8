import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { ExecutionListInstanceEachOptions } from 'twilio/lib/rest/studio/v2/flow/execution';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TWILIO_APP_NAME, TwilioError } from '../constants';
import { createTwilioClient } from '../helpers/constants';
import { getTwilioFlowAllowedValues } from '../helpers/get-flow-allowed-values';
import { TwilioExecutionResponseType } from '../response-types/execution';

const action = 'list_executions';

const options = {
  flowSid: {
    type: 'string',
    required: true,
    get_allowed_values: getTwilioFlowAllowedValues,
  },
  dateCreatedFrom: {
    type: 'date',
    required: false,
  },
  dateCreatedTo: {
    type: 'date',
    required: false,
  },
  limit: {
    type: 'integer',
    default_value: 50,
    required: false,
  },
  pageSize: {
    type: 'integer',
    default_value: 50,
    required: false,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'list',
  element_type: TwilioExecutionResponseType,
} satisfies TQoreResponseType;

type TListExecutionsRequest = ExecutionListInstanceEachOptions;

const listTwilioExecutions = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TWILIO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { username, password, flowSid } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['flowSid'],
      connectionFields: ['username', 'password'],
      ErrorClass: TwilioError,
    });

    const client = createTwilioClient(username, password);

    const { dateCreatedFrom, dateCreatedTo, limit, pageSize } = obj || {};

    try {
      const listOptions: TListExecutionsRequest = {
        ...(dateCreatedFrom && { dateCreatedFrom: new Date(dateCreatedFrom) }),
        ...(dateCreatedTo && { dateCreatedTo: new Date(dateCreatedTo) }),
        ...(limit !== undefined && { limit }),
        ...(pageSize !== undefined && { pageSize }),
      };

      return await client.studio.v2.flows(flowSid).executions.list(listOptions);
    } catch (error) {
      throw new TwilioError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default listTwilioExecutions;
