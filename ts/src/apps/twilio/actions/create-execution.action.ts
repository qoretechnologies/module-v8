import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { ExecutionListInstanceCreateOptions } from 'twilio/lib/rest/studio/v2/flow/execution';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TWILIO_APP_NAME, TwilioError } from '../constants';
import { createTwilioClient } from '../helpers/constants';
import { getTwilioFlowAllowedValues } from '../helpers/get-flow-allowed-values';
import { TwilioExecutionResponseType } from '../response-types/execution';
import { getTwilioPhoneNumberAllowedValues } from '../helpers/get-phone-number-allowed-values';

const action = 'create_execution';

const options = {
  flowSid: {
    type: 'string',
    required: true,
    get_allowed_values: getTwilioFlowAllowedValues,
  },
  to: {
    type: 'string',
    required: true,
  },
  from: {
    type: 'string',
    required: true,
    get_allowed_values: getTwilioPhoneNumberAllowedValues,
    allowed_values_creatable: true,
  },
  parameters: {
    type: 'hash',
    required: false,
  },
} satisfies TQoreOptions;

const responseType = TwilioExecutionResponseType;

type TCreateExecutionRequest = ExecutionListInstanceCreateOptions;

const createTwilioExecution = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TWILIO_APP_NAME,
  action: 'create_execution',
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { username, password, flowSid, ...requiredActionOptions } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['flowSid', 'to', 'from'],
      connectionFields: ['username', 'password'],
      ErrorClass: TwilioError,
    });

    const client = createTwilioClient(username, password);

    const { parameters } = obj || {};

    try {
      const executionData: TCreateExecutionRequest = {
        ...requiredActionOptions,
        ...(parameters && { parameters }),
      };

      const execution = await client.studio.v2.flows(flowSid).executions.create(executionData);

      return execution;
    } catch (error) {
      throw new TwilioError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default createTwilioExecution;
