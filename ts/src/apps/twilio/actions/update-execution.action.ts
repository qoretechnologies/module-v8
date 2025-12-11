import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { ExecutionContextUpdateOptions } from 'twilio/lib/rest/studio/v2/flow/execution';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TWILIO_APP_NAME, TwilioError } from '../constants';
import { createTwilioClient } from '../helpers/constants';
import {
  getTwilioExecutionAllowedValues,
  TwilioExecutionStatusAllowedValues,
} from '../helpers/get-execution-allowed-values';
import { getTwilioFlowAllowedValues } from '../helpers/get-flow-allowed-values';
import { TwilioExecutionResponseType } from '../response-types/execution';

const action = 'update_execution';

const options = {
  flowSid: {
    type: 'string',
    required: true,
    get_allowed_values: getTwilioFlowAllowedValues,
    on_change: ['refetch'],
  },
  executionSid: {
    type: 'string',
    required: true,
    get_allowed_values: getTwilioExecutionAllowedValues,
    depends_on: ['flowSid'],
  },
  status: {
    type: 'string',
    required: true,
    allowed_values: TwilioExecutionStatusAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = TwilioExecutionResponseType;

type TUpdateExecutionRequest = ExecutionContextUpdateOptions;

const updateTwilioExecution = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TWILIO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { username, password, flowSid, executionSid, status } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['flowSid', 'executionSid', 'status'],
      connectionFields: ['username', 'password'],
      ErrorClass: TwilioError,
    });

    const client = createTwilioClient(username, password);

    try {
      const updateData: TUpdateExecutionRequest = {
        status: status as any,
      };

      return await client.studio.v2.flows(flowSid).executions(executionSid).update(updateData);
    } catch (error) {
      throw new TwilioError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default updateTwilioExecution;
