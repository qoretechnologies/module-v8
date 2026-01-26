import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TWILIO_APP_NAME, TwilioError } from '../constants';
import { createTwilioClient } from '../helpers/constants';
import { getTwilioCallAllowedValues } from '../helpers/get-call-allowed-values';
import { TwilioCallResponseType } from '../response-types/call';

const action = 'get_call';

const options = {
  callSid: {
    type: 'string',
    required: true,
    get_allowed_values: getTwilioCallAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = TwilioCallResponseType;

const getTwilioCall = QoreAppCreator.createLocalizedAction<typeof options>({
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
      return await client.calls(callSid).fetch();
    } catch (error) {
      throw new TwilioError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default getTwilioCall;
