import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { TWILIO_APP_NAME, TwilioError } from '../constants';
import { createTwilioClient } from '../helpers/constants';
import { getTwilioMessageAllowedValues } from '../helpers/get-message-allowed-values';

const action = 'delete_message';

const options = {
  messageSid: {
    type: 'string',
    required: true,
    get_allowed_values: getTwilioMessageAllowedValues,
  },
} satisfies TQoreOptions;

const responseType = {
  type: 'hash',
  fields: {
    success: { type: 'bool' },
    messageSid: { type: 'string' },
  },
} satisfies TQoreResponseType;

const deleteTwilioMessage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TWILIO_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: responseType,
  api_function: async (obj, _opts, context) => {
    const { username, password, messageSid } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['messageSid'],
      connectionFields: ['username', 'password'],
      ErrorClass: TwilioError,
    });

    const client = createTwilioClient(username, password);

    try {
      const deleted = await client.messages(messageSid).remove();

      return {
        success: deleted,
        messageSid,
      };
    } catch (error) {
      throw new TwilioError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default deleteTwilioMessage;
