import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TWILIO_APP_NAME, TwilioError } from '../constants';
import { createTwilioClient } from '../helpers/constants';
import { getTwilioCallAllowedValues } from '../helpers/get-call-allowed-values';

const action = 'delete_call';

const options = {
  callSid: {
    type: 'string',
    required: true,
    get_allowed_values: getTwilioCallAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    callSid: { type: 'string' },
  },
} satisfies TQoreResponseType;

const deleteTwilioCall = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TWILIO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { username, password, callSid } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['callSid'],
      connectionFields: ['username', 'password'],
      ErrorClass: TwilioError,
    });

    const client = createTwilioClient(username, password);

    try {
      const deleted = await client.calls(callSid).remove();

      return {
        success: deleted,
        callSid,
      };
    } catch (error) {
      throw new TwilioError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default deleteTwilioCall;
