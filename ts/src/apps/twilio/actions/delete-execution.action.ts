import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TWILIO_APP_NAME, TwilioError } from '../constants';
import { createTwilioClient } from '../helpers/constants';
import { getTwilioExecutionAllowedValues } from '../helpers/get-execution-allowed-values';
import { getTwilioFlowAllowedValues } from '../helpers/get-flow-allowed-values';

const action = 'delete_execution';

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
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    executionSid: { type: 'string' },
  },
} satisfies TQoreResponseType;

const deleteTwilioExecution = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TWILIO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { username, password, flowSid, executionSid } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['flowSid', 'executionSid'],
      connectionFields: ['username', 'password'],
      ErrorClass: TwilioError,
    });

    const client = createTwilioClient(username, password);

    try {
      const deleted = await client.studio.v2.flows(flowSid).executions(executionSid).remove();

      return {
        success: deleted,
        executionSid,
      };
    } catch (error) {
      throw new TwilioError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default deleteTwilioExecution;
