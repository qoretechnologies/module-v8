import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { CallListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/call';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TWILIO_APP_NAME, TwilioError } from '../constants';
import { createTwilioClient } from '../helpers/constants';
import { TwilioCallResponseType } from '../response-types/call';
import { getTwilioPhoneNumberAllowedValues } from '../helpers/get-phone-number-allowed-values';

const action = 'create_call';

const options = {
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
  url: {
    type: 'string',
    required: false,
    required_groups: ['callInstructions'],
  },
  twiml: {
    type: 'string',
    required: false,
    required_groups: ['callInstructions'],
  },
  method: {
    type: 'string',
    required: false,
    allowed_values: [
      { display_name: 'GET', value: 'GET' },
      { display_name: 'POST', value: 'POST' },
    ],
  },
  statusCallback: {
    type: 'string',
    required: false,
  },
  statusCallbackEvent: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
    allowed_values: [
      { display_name: 'Initiated', value: 'initiated' },
      { display_name: 'Ringing', value: 'ringing' },
      { display_name: 'Answered', value: 'answered' },
      { display_name: 'Completed', value: 'completed' },
    ],
  },
  statusCallbackMethod: {
    type: 'string',
    required: false,
    allowed_values: [
      { display_name: 'GET', value: 'GET' },
      { display_name: 'POST', value: 'POST' },
    ],
  },
  timeout: {
    type: 'integer',
    required: false,
  },
  record: {
    type: 'bool',
    required: false,
  },
  recordingChannels: {
    type: 'string',
    required: false,
    allowed_values: [
      { display_name: 'Mono', value: 'mono' },
      { display_name: 'Dual', value: 'dual' },
    ],
    depends_on: ['record'],
  },
  recordingStatusCallback: {
    type: 'string',
    required: false,
    depends_on: ['record'],
  },
  machineDetection: {
    type: 'string',
    required: false,
    allowed_values: [
      { display_name: 'Enable', value: 'Enable' },
      { display_name: 'Detect Message End', value: 'DetectMessageEnd' },
    ],
  },
  machineDetectionTimeout: {
    type: 'integer',
    required: false,
    depends_on: ['machineDetection'],
  },
  sendDigits: {
    type: 'string',
    required: false,
  },
  timeLimit: {
    type: 'integer',
    required: false,
  },
} satisfies TQoreOptions;

const responseType = TwilioCallResponseType;

type TCreateCallRequest = CallListInstanceCreateOptions;

const createTwilioCall = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TWILIO_APP_NAME,
  action: 'create_call',
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { username, password, ...requiredActionOptions } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['to', 'from'],
      connectionFields: ['username', 'password'],
      ErrorClass: TwilioError,
    });

    const client = createTwilioClient(username, password);

    const {
      url,
      twiml,
      method,
      statusCallback,
      statusCallbackEvent,
      statusCallbackMethod,
      timeout,
      record,
      recordingChannels,
      recordingStatusCallback,
      machineDetection,
      machineDetectionTimeout,
      sendDigits,
      timeLimit,
    } = obj || {};

    try {
      const callData: TCreateCallRequest = {
        ...requiredActionOptions,
        ...(url && { url }),
        ...(twiml && { twiml }),
        ...(method && { method }),
        ...(statusCallback && { statusCallback }),
        ...(statusCallbackEvent && { statusCallbackEvent }),
        ...(statusCallbackMethod && { statusCallbackMethod }),
        ...(timeout !== undefined && { timeout }),
        ...(record !== undefined && { record }),
        ...(recordingChannels && { recordingChannels }),
        ...(recordingStatusCallback && { recordingStatusCallback }),
        ...(machineDetection && { machineDetection }),
        ...(machineDetectionTimeout !== undefined && { machineDetectionTimeout }),
        ...(sendDigits && { sendDigits }),
        ...(timeLimit !== undefined && { timeLimit }),
      };

      const call = await client.calls.create(callData);

      return call;
    } catch (error) {
      throw new TwilioError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default createTwilioCall;
